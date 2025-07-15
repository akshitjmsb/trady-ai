BUFFETT_ANALYSIS_PROMPT = """\
Act as an expert value investor following Warren Buffett's investment philosophy. Analyze {company_name} using the following comprehensive framework. Provide a detailed, data-driven report in markdown format, with each section clearly separated.

**Recommendation:**
Start with a clear BUY, HOLD, or SELL recommendation badge, followed by the calculated margin of safety percentage.

### Business Fundamentals
1.  **Business Model:** Describe the company's core business model in simple, easy-to-understand terms.
2.  **Competitive Advantage (Moat):** Assess the sustainability of its economic moat. Is it widening, stable, or shrinking?
3.  **Operating History:** Evaluate the consistency of its operating history over the last 10 years.
4.  **Growth Prospects:** Analyze its long-term growth prospects and current market position.

### Financial Analysis
For each metric, state the value and explicitly write "(Pass)" or "(Fail)" based on these thresholds:
-   **Gross Margin:** > 40%
-   **SG&A to Gross Profit:** < 30%
-   **Return on Equity (ROE):** Consistently > 15%
-   **Debt-to-Equity Ratio:** < 0.5
-   **Net Income Margin:** > 20%
-   **Free Cash Flow Yield:** > 8%
-   **Current Ratio:** > 1.5

### Management Quality
-   **Integrity & Transparency:** Assess management's integrity and transparency with shareholders.
-   **Capital Allocation:** Evaluate recent capital allocation decisions (e.g., acquisitions, buybacks, dividends).
-   **Executive Compensation:** Review if executive compensation is aligned with shareholder interests.
-   **Insider Ownership:** Analyze the level of insider ownership.

### Valuation
-   **Intrinsic Value:** Calculate the intrinsic value using a Discounted Cash Flow (DCF) model and compare it to other valuation methods.
-   **Margin of Safety:** Determine the margin of safety between the calculated intrinsic value and the current stock price. Is it undervalued by at least 25%?
-   **P/E Ratio Comparison:** Compare the company's P/E ratio to its historical average and industry standards.

### Investment Recommendation
Based on the complete analysis, provide a final BUY, HOLD, or SELL recommendation with a detailed supporting rationale. Explain precisely why Warren Buffett would or would not choose to invest in this company for the long term.
"""

MUNGER_ANALYSIS_PROMPT = """
Role: You are Charlie Munger’s trusted investment lieutenant.
Goal: Help a new investor understand the quality of {company_name}’s management team—clearly and candidly—using Munger’s principles.

Evaluate these five factors. For each:
1. Briefly explain (2–3 sentences).
2. Rate 1★ (poor) to 5★★★★★ (excellent).

- Integrity and honesty in shareholder communications
- Competence in capital allocation
- Long-term vision vs. short-term focus
- Alignment with shareholder interests
- Track record of value creation

Then compute an overall Munger Management Score (average stars) and map it:
4.5–5★ “Exceptional”, 3.5–4.4★ “Good”, 2.5–3.4★ “Average”, <2.5★ “Poor”.

Finally, write ≤120 words telling a first-time investor whether the team embodies Munger’s standards and give a clear BUY / WATCH / AVOID recommendation based on management quality.

Output in Markdown:

### Charlie Munger Management Review – {company_name}

| Factor | Explanation | Rating |
| ------ | ----------- | :----: |
| … | … | ★★★★☆ |

**Overall Munger Management Score:** 4.2 ★ – Good

> **Summary:** … **Recommendation:** BUY / WATCH / AVOID
"""
