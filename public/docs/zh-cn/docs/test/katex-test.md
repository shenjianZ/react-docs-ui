# 🧪 KaTeX 全功能测试

> 用于验证 KaTeX 是否正确加载所有扩展（mhchem / physics / mathtools 等）

---

## ✅ 行内公式

爱因斯坦质能方程：  
$E = mc^2$

欧拉公式：  
$e^{i\pi} + 1 = 0$

分数测试：  
$\frac{a+b}{c+d}$

根号测试：  
$\sqrt{2},\ \sqrt[n]{x}$

---

## ✅ 块级公式

$$
\int_{-\infty}^{\infty} e^{-x^2}\,dx = \sqrt{\pi}
$$

$$
\sum_{n=1}^{\infty} \frac{1}{n^2} = \frac{\pi^2}{6}
$$

---

## ✅ 矩阵（mathtools）

### 基础矩阵

$$
\begin{matrix}
1 & 2 \\
3 & 4
\end{matrix}
$$

### 括号矩阵

$$
\begin{pmatrix}
a & b \\
c & d
\end{pmatrix}
$$

### 方括号矩阵

$$
\begin{bmatrix}
1 & 0 \\
0 & 1
\end{bmatrix}
$$

### 行列式

$$
\begin{vmatrix}
a & b \\
c & d
\end{vmatrix}
$$

---

## ✅ 对齐环境（ams）

$$
\begin{aligned}
a^2 + b^2 &= c^2 \\
e^{i\theta} &= \cos\theta + i\sin\theta
\end{aligned}
$$

---

## ✅ 分段函数

$$
f(x) =
\begin{cases}
x^2 & x \ge 0 \\
-x & x < 0
\end{cases}
$$

---

## ✅ 化学公式（mhchem）

水：

$$
\ce{H2O}
$$

燃烧反应：

$$
\ce{CH4 + 2O2 -> CO2 + 2H2O}
$$

可逆反应：

$$
\ce{A <=> B}
$$

离子：

$$
\ce{Na+ + Cl- -> NaCl}
$$

---

## ✅ physics 宏测试

导数：

$$
\dv{y}{x}
$$

偏导：

$$
\pdv{f}{x}
$$

二阶导：

$$
\dv[2]{y}{x}
$$

绝对值：

$$
\abs{x}
$$

范数：

$$
\norm{\vec{v}}
$$

期望值：

$$
\expval{A}
$$

括号自动伸缩：

$$
\qty(\frac{a}{b})
$$

---

## ✅ mathtools 扩展

多行对齐：

$$
\begin{aligned}
\max_x \quad & x^2 + 2x \\
\text{s.t.}\quad & x \ge 0
\end{aligned}
$$

带标签：

$$
\underbrace{a+b+\cdots+z}_{26}
$$

---

## ✅ 常用数学符号

希腊字母：

$$
\alpha,\ \beta,\ \gamma,\ \Gamma,\ \Delta,\ \Omega
$$

关系符号：

$$
\le,\ \ge,\ \neq,\ \approx,\ \equiv
$$

集合符号：

$$
\in,\ \notin,\ \subset,\ \supset,\ \cup,\ \cap
$$

箭头：

$$
\rightarrow,\ \Rightarrow,\ \leftrightarrow,\ \mapsto
$$

---

## 🚨 极限压力测试（很重要）

> 如果这一段渲染正常，说明 KaTeX 基本完全 OK

$$
\pdv{ }{t}\qty(
\int_{V} \rho(\vb{r},t)\, dV
) =
- \oint_{S} \rho \vb{v} \cdot d\vb{S}
$$

$$
\ce{^{235}_{92}U + ^1_0n -> ^{236}_{92}U -> ^{141}_{56}Ba + ^{92}_{36}Kr + 3^1_0n}
$$

$$
\begin{aligned}
\mathcal{L} &= \frac{1}{2} m \dot{x}^2 - V(x) \\
\hat{H}\psi &= i\hbar \pdv{\psi}{t}
\end{aligned}
$$

---

## ✅ 渲染检查清单

- [ ] 行内公式正常
- [ ] 块级公式居中
- [ ] 矩阵对齐正确
- [ ] mhchem 正常
- [ ] physics 宏正常
- [ ] 对齐环境正常
- [ ] 移动端不溢出
- [ ] 暗色模式可见

---



# 🎉 如果全部通过

👉 你的 KaTeX 配置已经是**完整版**
