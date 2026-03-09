use actix_cors::Cors;
use actix_web::{middleware, web, App, HttpResponse, HttpServer};
use serde::{Deserialize, Serialize};
use std::env;

mod parser;
mod pdf;
mod styles;

#[derive(Deserialize)]
struct PdfRequest {
    url: Option<String>,
    content: Option<String>,
    filename: Option<String>,
    title: Option<String>,
}

#[derive(Serialize)]
struct HealthResponse {
    status: String,
    timestamp: String,
}

#[derive(Serialize)]
struct ErrorResponse {
    error: String,
    message: String,
}

async fn health() -> HttpResponse {
    HttpResponse::Ok().json(HealthResponse {
        status: "ok".to_string(),
        timestamp: chrono::Utc::now().to_rfc3339(),
    })
}

async fn generate_pdf(req: web::Json<PdfRequest>) -> HttpResponse {
    let content = match (&req.content, &req.url) {
        (Some(content), _) => content.clone(),
        (None, Some(url)) => {
            match fetch_content(url).await {
                Ok(c) => c,
                Err(e) => {
                    return HttpResponse::InternalServerError().json(ErrorResponse {
                        error: "FetchError".to_string(),
                        message: e,
                    });
                }
            }
        }
        (None, None) => {
            return HttpResponse::BadRequest().json(ErrorResponse {
                error: "ValidationError".to_string(),
                message: "Either 'content' or 'url' is required".to_string(),
            });
        }
    };

    let title = req.title.clone().unwrap_or_else(|| "Document".to_string());
    
    match pdf::generate_pdf(&content, &title) {
        Ok(bytes) => {
            let filename = req.filename.clone().unwrap_or_else(|| "document.pdf".to_string());
            let encoded = urlencoding::encode(&filename);
            HttpResponse::Ok()
                .content_type("application/pdf")
                .insert_header(("Content-Disposition", format!("attachment; filename*=UTF-8''{}", encoded)))
                .body(bytes)
        }
        Err(e) => {
            HttpResponse::InternalServerError().json(ErrorResponse {
                error: "PdfGenerationError".to_string(),
                message: e,
            })
        }
    }
}

async fn fetch_content(url: &str) -> Result<String, String> {
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(30))
        .build()
        .map_err(|e| e.to_string())?;
    
    let response = client.get(url).send().await.map_err(|e| e.to_string())?;
    let text = response.text().await.map_err(|e| e.to_string())?;
    
    Ok(text)
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init();
    
    let port = env::var("PDF_SERVER_PORT")
        .unwrap_or_else(|_| "6965".to_string())
        .parse::<u16>()
        .unwrap_or(6965);

    println!("[PDF Server] Running on http://0.0.0.0:{}", port);
    println!("[PDF Server] Memory usage: ~10-50MB");

    HttpServer::new(|| {
        let cors = Cors::permissive();
        
        App::new()
            .wrap(cors)
            .wrap(middleware::Logger::default())
            .route("/health", web::get().to(health))
            .route("/generate-pdf", web::post().to(generate_pdf))
    })
    .bind(("0.0.0.0", port))?
    .run()
    .await
}
