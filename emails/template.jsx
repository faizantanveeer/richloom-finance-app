import { Body, Button, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components";
import * as React from "react";

export default function EmailTemplate({
  userName = "",
  type = "budget-alert",
  data = {},
}) {
  const remainingAmount = data.budgetAmount - data.totalExpense;
  const isCritical = data.percentageUsed >= 90;
  const isWarning = data.percentageUsed >= 80 && data.percentageUsed < 90;

  return (
    <Html>
      <Head />  
      <Preview>{isCritical ? '⚠️ Critical Budget Alert' : 'Your Budget Update'}</Preview>
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
                You've used{' '}
                <strong style={isCritical ? criticalText : isWarning ? warningText : normalText}>
                  {parseFloat(data.percentageUsed).toFixed(1)}%
                </strong>{' '}
                of your monthly budget
              </Text>
              
              {/* Fluid progress bar */}
              <div style={progressContainer}>
                <div 
                  style={{
                    ...progressBar,
                    width: `${Math.min(data.percentageUsed, 100)}%`,
                    background: isCritical 
                      ? 'linear-gradient(90deg, #ef4444, #dc2626)'
                      : isWarning
                      ? 'linear-gradient(90deg, #f59e0b, #eab308)'
                      : 'linear-gradient(90deg, #10b981, #059669)'
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
                <Text style={summaryValue}>${data.budgetAmount?.toLocaleString()}</Text>
              </div>
              
              <div style={summaryCard}>
                <Text style={summaryLabel}>Amount Spent</Text>
                <Text style={{...summaryValue, color: isCritical ? '#ef4444' : '#f59e0b'}}>
                  ${data.totalExpense?.toLocaleString()}
                </Text>
              </div>
              
              <div style={{...summaryCard, borderColor: '#059669'}}>
                <Text style={summaryLabel}>Remaining</Text>
                <Text style={{...summaryValue, color: '#059669'}}>
                  ${remainingAmount?.toLocaleString()}
                </Text>
              </div>
            </div>

            {/* Responsive action section */}
            <div style={actionCard}>
              <Text style={actionText}>
                {isCritical 
                  ? 'You have nearly exhausted your budget. Consider reviewing your expenses.'
                  : isWarning
                  ? 'You are approaching your budget limit. Stay mindful of your spending.'
                  : 'You are managing your budget well. Keep it up!'}
              </Text>
              <Button
                href="https://yourapp.com/dashboard"
                style={actionButton}
              >
                Review Budget
              </Button>
            </div>
          </Section>

          {/* Fluid footer */}
          <Section style={footer}>
            <Text style={footerText}>Financial Wellness Tracker</Text>
            <div style={footerDivider}></div>
            <Text style={footerSmallText}>
              Need help? <a href="mailto:support@yourapp.com" style={footerLink}>Contact our support team</a>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Base font size for rem units
const baseFontSize = 16;

// Responsive styles using relative units
const main = {
  backgroundColor: "#f8fafc",
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
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