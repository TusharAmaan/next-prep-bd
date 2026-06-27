import RichTextDisplay from "@/components/shared/RichTextDisplay";

export default function SpatialMathTestPage() {
  const content = `
    <h1>Spatial Analysis & Remote Sensing Math Rendering Test</h1>
    <p>This page tests MathJax rendering limits within a JavaScript template literal using complex formulas common in geographic information systems and environmental fieldwork.</p>
    
    <h3>1. Land Surface Temperature (LST) Correction</h3>
    <p>Testing nested fractions, parentheses sizing, and Greek letters:</p>
    $$
    LST = \\frac{T_B}{1 + \\left(\\frac{\\lambda T_B}{\\rho}\\right) \\ln \\varepsilon}
    $$

    <h3>2. Global Moran's I (Spatial Autocorrelation)</h3>
    <p>Testing multiple large summation operators, subscripts, and overlines for spatial inequality analysis:</p>
    $$
    I = \\frac{N}{W} \\frac{\\sum_{i=1}^N \\sum_{j=1}^N w_{ij} (x_i - \\bar{x})(x_j - \\bar{x})}{\\sum_{i=1}^N (x_i - \\bar{x})^2}
    $$

    <h3>3. Geographically Weighted Regression (GWR)</h3>
    <p>Testing subscript positioning next to parameterized functions:</p>
    $$
    y_i = \\beta_0(u_i, v_i) + \\sum_{k=1}^p \\beta_k(u_i, v_i) x_{ik} + \\varepsilon_i
    $$

    <h3>4. Land Use Change Transition Matrix (Markov Chain)</h3>
    <p>Testing matrix environments, alignment, and vertical/horizontal ellipses:</p>
    $$
    P = \\begin{pmatrix}
    p_{11} & p_{12} & \\cdots & p_{1n} \\\\
    p_{21} & p_{22} & \\cdots & p_{2n} \\\\
    \\vdots & \\vdots & \\ddots & \\vdots \\\\
    p_{n1} & p_{n2} & \\cdots & p_{nn}
    \\end{pmatrix}
    $$

    <h3>5. Soil Adjusted Vegetation Index (SAVI) & NDVI</h3>
    <p>Testing standard algebraic block equations:</p>
    $$
    SAVI = \\frac{(NIR - Red)}{(NIR + Red + L)} \\times (1 + L)
    $$
    $$
    NDVI = \\frac{NIR - Red}{NIR + Red}
    $$

    <h3>6. Gravity Model of Spatial Interaction</h3>
    <p>Testing exponents combined with subscripts:</p>
    $$
    T_{ij} = k \\frac{P_i P_j}{d_{ij}^\\beta}
    $$

    <h3>7. Aligned Multi-Step Equations</h3>
    <p>Testing the aligned environment to ensure the equals signs line up perfectly across multiple lines:</p>
    $$
    \\begin{aligned}
    RMSE &= \\sqrt{\\frac{1}{n} \\sum_{i=1}^n (y_i - \\hat{y}_i)^2} \\\\
    MAE &= \\frac{1}{n} \\sum_{i=1}^n |y_i - \\hat{y}_i|
    \\end{aligned}
    $$

    <h3>8. Inline Math Torture Test</h3>
    <p>Here is an inline equation \\( \\rho = h \\frac{c}{k} \\) embedded directly within a paragraph. We can also include a more complex inline limit like \\( \\lim_{\\Delta x \\to 0} \\frac{f(x+\\Delta x) - f(x)}{\\Delta x} \\) to ensure that the fractional line heights do not clip into the paragraph text above or below it, and that the horizontal spacing remains perfectly readable.</p>
  `;

  return (
    <div className="container mx-auto p-10 max-w-4xl">
      <RichTextDisplay content={content} className="prose lg:prose-xl dark:prose-invert" />
    </div>
  );
}