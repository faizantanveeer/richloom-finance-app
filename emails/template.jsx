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
          {/* Elegant header with subtle pattern */}
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
              
              {/* Sophisticated progress bar */}
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

            {/* Financial summary in elegant cards */}
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

            {/* Action section */}
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

          {/* Minimalist footer */}
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

// Modern green theme styles
const main = {
  backgroundColor: "#f8fafc",
  fontFamily:
    "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
  padding: "40px 0",
  color: "#1f2937",
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  maxWidth: "600px",
  borderRadius: "12px",
  boxShadow: "0 4px 24px rgba(5, 46, 22, 0.08)",
  overflow: "hidden",
};

const header = {
  padding: "40px 40px 20px",
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
  height: "8px",
  background: "linear-gradient(90deg, #059669, #10b981)",
};

const title = {
  color: "#064e3b",
  fontSize: "24px",
  fontWeight: "700",
  margin: "0 0 8px",
  letterSpacing: "-0.5px",
};

const greeting = {
  color: "#6b7280",
  fontSize: "16px",
  margin: "0",
};

const content = {
  padding: "0 40px 32px",
};

const alertCard = {
  backgroundColor: "#f0fdf4",
  borderRadius: "12px",
  padding: "24px",
  margin: "0 0 32px",
  border: "1px solid #d1fae5",
};

const alertText = {
  fontSize: "18px",
  lineHeight: "1.5",
  margin: "0 0 20px",
  color: "#064e3b",
  textAlign: "center",
};

const normalText = {
  color: "#059669",
  fontWeight: "700",
};

const warningText = {
  color: "#d97706",
  fontWeight: "700",
};

const criticalText = {
  color: "#dc2626",
  fontWeight: "700",
};

const progressContainer = {
  margin: "0 auto",
  maxWidth: "400px",
};

const progressBar = {
  height: "10px",
  borderRadius: "20px",
  marginBottom: "8px",
};

const progressLabel = {
  display: "flex",
  justifyContent: "space-between",
  fontSize: "12px",
  color: "#6b7280",
};

const summaryGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr",
  gap: "16px",
  margin: "0 0 32px",
};

const summaryCard = {
  padding: "20px",
  borderRadius: "12px",
  border: "1px solid #e5e7eb",
  textAlign: "center",
  backgroundColor: "#f9fafb",
};

const summaryLabel = {
  color: "#6b7280",
  fontSize: "14px",
  margin: "0 0 8px",
  fontWeight: "500",
  letterSpacing: "0.5px",
};

const summaryValue = {
  color: "#064e3b",
  fontSize: "20px",
  fontWeight: "700",
  margin: "0",
};

const actionCard = {
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  padding: "24px",
  border: "1px solid #e5e7eb",
  textAlign: "center",
};

const actionText = {
  fontSize: "16px",
  lineHeight: "1.5",
  margin: "0 0 20px",
  color: "#1f2937",
};

const actionButton = {
  backgroundColor: "#059669",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  padding: "12px 24px",
  borderRadius: "8px",
  textDecoration: "none",
  display: "inline-block",
  boxShadow: "0 2px 4px rgba(5, 150, 105, 0.2)",
};

const footer = {
  padding: "24px 40px",
  backgroundColor: "#f9fafb",
  textAlign: "center",
  borderTop: "1px solid #e5e7eb",
};

const footerText = {
  color: "#064e3b",
  fontSize: "14px",
  fontWeight: "600",
  margin: "0 0 12px",
};

const footerDivider = {
  height: "1px",
  backgroundColor: "#e5e7eb",
  margin: "12px 0",
};

const footerSmallText = {
  color: "#6b7280",
  fontSize: "12px",
  margin: "0",
};

const footerLink = {
  color: "#059669",
  textDecoration: "underline",
};