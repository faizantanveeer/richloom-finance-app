import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

const PREVIEW_DATA = {
  monthlyReport: {
    userName: "John Doe",
    type: "monthly-report",
    data: {
      month: "December",
      stats: {
        totalIncome: 5000,
        totalExpenses: 3500,
        byCategory: {
          housing: 1500,
          groceries: 600,
          transportation: 400,
          entertainment: 300,
          utilities: 700,
        },
      },
      insights: [
        "Your housing expenses are 43% of your total spending - consider reviewing your housing costs.",
        "Great job keeping entertainment expenses under control this month!",
        "Setting up automatic savings could help you save 20% more of your income.",
      ],
    },
  },
  budgetAlert: {
    userName: "John Doe",
    type: "budget-alert",
    data: {
      percentageUsed: 85,
      budgetAmount: 4000,
      totalExpenses: 3400,
    },
  },
};

export default function EmailTemplate({
  userName = "",
  type = "monthly-report",
  data = {},
}) {
  if (type === "monthly-report") {
    console.log("Given Data", data);
    const income = data?.stats.totalIncome || 0;
    const expenses = data?.stats.totalExpense || 0;
    const savings = income - expenses;

    console.log("data", data);
    const savingsPercentage =
      income > 0 ? ((savings / income) * 100).toFixed(1) : "0.0";

    // Extract the highest category
    const highestCategory = Object.entries(data.stats.byCategory).reduce(
      (max, [category, amount]) =>
        amount > max.amount ? { category, amount } : max,
      { category: "", amount: 0 }
    );

    return (
      <Html>
        <Head />
        <Preview>Your {data?.month} Financial Report</Preview>
        <Body style={main}>
          <Container style={container}>
            <div style={header}>
              <div style={headerPattern}></div>
              <Heading style={title}>Monthly Financial Report</Heading>
              <Text style={greeting}>Hello {userName},</Text>
              <Text style={monthHeader}>{data?.month} Summary</Text>
            </div>

            <Section style={content}>
              {/* Metrics */}
              <div style={metricsGrid}>
                <div style={metricCard}>
                  <Text style={metricLabel}>Total Income</Text>
                  <Text style={{ ...metricValue, color: "#059669" }}>
                    ${income?.toLocaleString()}
                  </Text>
                </div>

                <div style={metricCard}>
                  <Text style={metricLabel}>Total Expenses</Text>
                  <Text style={{ ...metricValue, color: "#dc2626" }}>
                    ${expenses?.toLocaleString()}
                  </Text>
                </div>

                <div
                  style={{
                    ...metricCard,
                    borderColor: savings >= 0 ? "#059669" : "#dc2626",
                  }}
                >
                  <Text style={metricLabel}>
                    {savings >= 0 ? "Savings" : "Deficit"}
                  </Text>
                  <Text
                    style={{
                      ...metricValue,
                      color: savings >= 0 ? "#059669" : "#dc2626",
                    }}
                  >
                    ${Math.abs(savings).toLocaleString()} ({savingsPercentage}%)
                  </Text>
                </div>
              </div>

              {/* Spending Breakdown */}
              {data?.stats?.byCategory && (
                <Section style={section}>
                  <Heading style={sectionTitle}>Expenses by Category</Heading>
                  <div style={categoryGrid}>
                    {Object.entries(data.stats.byCategory).map(
                      ([category, amount]) => (
                        <div key={category} style={categoryCard}>
                          <Text style={categoryLabel}>
                            {category.charAt(0).toUpperCase() +
                              category.slice(1)}
                          </Text>
                          <Text style={categoryAmount}>
                            ${amount.toLocaleString()}
                          </Text>
                        </div>
                      )
                    )}
                  </div>
                </Section>
              )}

              {/* Insights */}
              {data?.insights && (
                <div style={section}>
                  <Heading style={sectionTitle}>Financial Insights</Heading>
                  <div style={insightsCard}>
                    {data.insights.map((insight, index) => (
                      <div key={index} style={insightItem}>
                        <Text style={insightText}>• {insight}</Text>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Summary */}
              <Section style={section}>
                <Heading style={sectionTitle}>Transaction Summary</Heading>
                <div style={summaryGrid}>
                  <div style={summaryCard}>
                    <Text style={summaryLabel}>Average Daily Spend</Text>
                    <Text style={summaryValue}>
                      ${expenses ? (expenses / 30).toFixed(2) : "0.00"}
                    </Text>
                  </div>
                  <div style={summaryCard}>
                    <Text style={summaryLabel}>Highest Expense Category</Text>
                    <Text style={summaryValue}>
                      {highestCategory.category.charAt(0).toUpperCase() +
                        highestCategory.category.slice(1) || "N/A"}
                    </Text>
                  </div>
                  <div style={summaryCard}>
                    <Text style={summaryLabel}>% Spent</Text>
                    <Text style={summaryValue}>
                      {income ? ((expenses / income) * 100).toFixed(1) : "0"}%
                    </Text>
                  </div>
                </div>
              </Section>

              {/* CTA */}
              <div style={actionCard}>
                <Text style={actionText}>
                  Ready to optimize your finances for next month?
                </Text>
                <Button
                  href="https://richloom.com/dashboard"
                  style={actionButton}
                >
                  View Full Report
                </Button>
              </div>
            </Section>

            {/* Footer */}
            <Section style={footer}>
              <Text style={footerText}>Richloom: Best Finance Tracker</Text>
              <div style={footerDivider}></div>
              <Text style={footerSmallText}>
                Need help interpreting your report?{" "}
                <a href="mailto:support@richloom.com" style={footerLink}>
                  Contact our support team
                </a>
              </Text>
            </Section>
          </Container>
        </Body>
      </Html>
    );
  }

  if (type === "budget-alert") {
    const remainingAmount = data.budgetAmount - data.totalExpense;
    const isCritical = data.percentageUsed >= 90;
    const isWarning = data.percentageUsed >= 80 && data.percentageUsed < 90;

    return (
      <Html>
        <Head />
        <Preview>
          {isCritical ? "⚠️ Critical Budget Alert" : "Your Budget Update"}
        </Preview>
        <Body style={main}>
          <Container style={container}>
            {/* Header with relative units */}
            <div style={header}>
              <div style={headerPattern}></div>
              <Heading style={title}>Budget Overview</Heading>
              <Text style={greeting}>Hello {userName},</Text>
            </div>

            <Section style={content}>
              {/* Main alert card */}
              <div style={alertCard}>
                <Text style={alertText}>
                  You've used{" "}
                  <strong
                    style={
                      isCritical
                        ? criticalText
                        : isWarning
                          ? warningText
                          : normalText
                    }
                  >
                    {parseFloat(data.percentageUsed).toFixed(1)}%
                  </strong>{" "}
                  of your monthly budget
                </Text>

                {/* Fluid progress bar */}
                <div style={progressContainer}>
                  <div
                    style={{
                      ...progressBar,
                      width: `${Math.min(data.percentageUsed, 100)}%`,
                      background: isCritical
                        ? "linear-gradient(90deg, #ef4444, #dc2626)"
                        : isWarning
                          ? "linear-gradient(90deg, #f59e0b, #eab308)"
                          : "linear-gradient(90deg, #10b981, #059669)",
                    }}
                  ></div>
                  <div style={progressLabel}>
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>

              {/* Fluid grid layout */}
              <div style={summaryGrid}>
                <div style={summaryCard}>
                  <Text style={summaryLabel}>Total Budget</Text>
                  <Text style={summaryValue}>
                    ${data.budgetAmount?.toLocaleString()}
                  </Text>
                </div>

                <div style={summaryCard}>
                  <Text style={summaryLabel}>Amount Spent</Text>
                  <Text
                    style={{
                      ...summaryValue,
                      color: isCritical ? "#ef4444" : "#f59e0b",
                    }}
                  >
                    ${data.totalExpense?.toLocaleString()}
                  </Text>
                </div>

                <div style={{ ...summaryCard, borderColor: "#059669" }}>
                  <Text style={summaryLabel}>Remaining</Text>
                  <Text style={{ ...summaryValue, color: "#059669" }}>
                    ${remainingAmount?.toLocaleString()}
                  </Text>
                </div>
              </div>

              {/* Responsive action section */}
              <div style={actionCard}>
                <Text style={actionText}>
                  {isCritical
                    ? "You have nearly exhausted your budget. Consider reviewing your expenses."
                    : isWarning
                      ? "You are approaching your budget limit. Stay mindful of your spending."
                      : "You are managing your budget well. Keep it up!"}
                </Text>
                <Button
                  href="https://richloom.com/dashboard"
                  style={actionButton}
                >
                  Review Budget
                </Button>
              </div>
            </Section>

            {/* Fluid footer */}
            <Section style={footer}>
              <Text style={footerText}>Richloom: Best Finance Tracker</Text>
              <div style={footerDivider}></div>
              <Text style={footerSmallText}>
                Need help?{" "}
                <a href="mailto:support@richloom.com" style={footerLink}>
                  Contact our support team
                </a>
              </Text>
            </Section>
          </Container>
        </Body>
      </Html>
    );
  }
}
// Base font size for rem units
const baseFontSize = 16;

// Responsive styles using relative units
const main = {
  backgroundColor: "#f8fafc",
  fontFamily:
    "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  padding: "1.25rem 0",
  color: "#1f2937",
  width: "100%",
  fontSize: `${baseFontSize}px`,
  lineHeight: 1.5,
  overflowX: "hidden",
  justifyContent: "center",
  alignItems: "center",
  display: "flex",
  flexDirection: "column",
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  maxWidth: "37.5rem", // 600px
  width: "92%", // Leaves 4% padding on each side
  borderRadius: "0.75rem",
  boxShadow: "0 0.25rem 1.5rem rgba(5, 46, 22, 0.08)",
  overflow: "hidden",
  "@media (max-width: 480px)": {
    width: "100%",
    borderRadius: 0,
    boxShadow: "none",
  },
};

const header = {
  padding: "1.875rem 1.25rem 0.9375rem",
  background: "#ffffff",
  color: "#064e3b",
  position: "relative",
  textAlign: "center",
  borderBottom: "1px solid #e5e7eb",
};

const headerPattern = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  height: "0.375rem",
  background: "linear-gradient(90deg, #059669, #10b981)",
};

const title = {
  color: "#064e3b",
  fontSize: "1.5rem",
  fontWeight: 700,
  margin: "0 0 0.5rem",
  lineHeight: 1.3,
};

const greeting = {
  color: "#6b7280",
  fontSize: "1rem",
  margin: 0,
};

const content = {
  padding: "0 1.25rem 1.25rem",
  "@media (min-width: 480px)": {
    padding: "0 1.875rem 1.875rem",
  },
};

const alertCard = {
  backgroundColor: "#f0fdf4",
  borderRadius: "0.625rem",
  padding: "1.25rem",
  margin: "0 0 1.5rem",
  border: "1px solid #d1fae5",
};

const alertText = {
  fontSize: "1.125rem",
  lineHeight: 1.5,
  margin: "0 0 1rem",
  color: "#064e3b",
  textAlign: "center",
};

const normalText = {
  color: "#059669",
  fontWeight: 700,
};

const warningText = {
  color: "#d97706",
  fontWeight: 700,
};

const criticalText = {
  color: "#dc2626",
  fontWeight: 700,
};

const progressContainer = {
  margin: "0 auto",
  maxWidth: "25rem",
  width: "100%",
};

const progressBar = {
  height: "0.5rem",
  borderRadius: "1.25rem",
  marginBottom: "0.5rem",
};

const progressLabel = {
  display: "flex",
  justifyContent: "space-between",
  width: "100%",
  fontSize: "0.75rem",
  color: "#6b7280",
};

const summaryGrid = {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: "0.75rem",
  margin: "0 0 1.5rem",
  "@media (min-width: 480px)": {
    gridTemplateColumns: "1fr 1fr",
  },
  "@media (min-width: 640px)": {
    gridTemplateColumns: "1fr 1fr 1fr",
  },
};

const summaryCard = {
  padding: "1rem",
  borderRadius: "0.625rem",
  border: "1px solid #e5e7eb",
  textAlign: "center",
  backgroundColor: "#f9fafb",
};

const summaryLabel = {
  color: "#6b7280",
  fontSize: "0.875rem",
  margin: "0 0 0.5rem",
  fontWeight: 500,
};

const summaryValue = {
  color: "#064e3b",
  fontSize: "1.25rem",
  fontWeight: 700,
  margin: 0,
};

const actionCard = {
  backgroundColor: "#ffffff",
  borderRadius: "0.625rem",
  padding: "1.25rem",
  border: "1px solid #e5e7eb",
  textAlign: "center",
};

const actionText = {
  fontSize: "1rem",
  lineHeight: 1.5,
  margin: "0 0 1rem",
  color: "#1f2937",
};

const actionButton = {
  backgroundColor: "#059669",
  color: "#ffffff",
  fontSize: "1rem",
  fontWeight: 600,
  padding: "0.75rem 0.1rem",
  borderRadius: "0.5rem 0.5rem",
  textDecoration: "none",
  boxShadow: "0 0.125rem 0.25rem rgba(5, 150, 105, 0.2)",
  width: "100%",
  textAlign: "center",
};

const footer = {
  padding: "1.25rem",
  backgroundColor: "#f9fafb",
  textAlign: "center",
  borderTop: "1px solid #e5e7eb",
};

const footerText = {
  color: "#064e3b",
  fontSize: "0.875rem",
  fontWeight: 600,
  margin: "0 0 0.75rem",
};

const footerDivider = {
  height: "1px",
  backgroundColor: "#e5e7eb",
  margin: "0.75rem 0",
};

const footerSmallText = {
  color: "#6b7280",
  fontSize: "0.75rem",
  margin: 0,
};

const footerLink = {
  color: "#059669",
  textDecoration: "underline",
};

const monthHeader = {
  color: "#064e3b",
  fontSize: "1.25rem",
  fontWeight: 600,
  margin: "0.5rem 0 0",
};

const metricsGrid = {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: "1rem",
  margin: "0 0 2rem",
  "@media (min-width: 480px)": {
    gridTemplateColumns: "1fr 1fr 1fr",
  },
};

const metricCard = {
  padding: "1.25rem",
  borderRadius: "0.625rem",
  border: "1px solid #e5e7eb",
  backgroundColor: "#f9fafb",
  textAlign: "center",
};

const metricLabel = {
  color: "#6b7280",
  fontSize: "0.875rem",
  margin: "0 0 0.5rem",
  fontWeight: 500,
};

const metricValue = {
  fontSize: "1.5rem",
  fontWeight: 700,
  margin: 0,
};

const section = {
  margin: "0 0 2rem",
};

const sectionTitle = {
  color: "#064e3b",
  fontSize: "1.25rem",
  fontWeight: 600,
  margin: "0 0 1rem",
};

const viewAllText = {
  color: "#3b82f6",
  fontSize: "0.875rem",
  textAlign: "center",
  margin: "1rem 0 0",
};

const noDataText = {
  color: "#6b7280",
  fontSize: "0.875rem",
  textAlign: "center",
  padding: "1rem",
};

const insightsCard = {
  backgroundColor: "#f0fdf4",
  borderRadius: "0.625rem",
  padding: "1.25rem",
  border: "1px solid #d1fae5",
};

const insightItem = {
  margin: "0 0 0.5rem",
};

const insightText = {
  color: "#064e3b",
  fontSize: "0.9375rem",
  lineHeight: 1.5,
};

const summaryRow = {
  display: "flex",
  justifyContent: "space-between",
  margin: "0 0 0.75rem",
  "&:last-child": {
    margin: 0,
  },
};

const categoryGrid = {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: "1rem",
  margin: "0 0 1rem",
  "@media (min-width: 480px)": {
    gridTemplateColumns: "1fr 1fr",
  },
  "@media (min-width: 768px)": {
    gridTemplateColumns: "1fr 1fr 1fr",
  },
};

const categoryCard = {
  padding: "1rem",
  borderRadius: "0.5rem",
  border: "1px solid #e5e7eb",
  backgroundColor: "#ffffff",
};

const categoryLabel = {
  color: "#1f2937",
  fontSize: "0.875rem",
  fontWeight: 500,
  margin: "0 0 0.5rem",
};

const categoryAmount = {
  color: "#064e3b",
  fontSize: "1.125rem",
  fontWeight: 600,
  margin: 0,
};
