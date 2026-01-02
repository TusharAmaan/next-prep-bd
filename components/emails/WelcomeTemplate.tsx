import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Hr,
  Row,
  Column,
} from '@react-email/components';

interface WelcomeEmailProps {
  userFirstname: string;
}

export const WelcomeTemplate = ({ userFirstname }: WelcomeEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Welcome to NextPrepBD - Your Ultimate Exam Companion</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* LOGO AREA - Replace src with your actual hosted logo URL later */}
          <Section style={logoSection}>
             <Heading style={h1}>NextPrep<span style={{color: '#2563eb'}}>BD</span></Heading>
          </Section>

          <Section style={heroSection}>
            <Heading style={heroTitle}>Welcome, {userFirstname}!</Heading>
            <Text style={text}>
              We are thrilled to have you join <strong>NextPrepBD</strong>. You have just taken the first step towards mastering your academic goals.
            </Text>
          </Section>

          <Hr style={hr} />

          {/* VISUAL OFFERINGS SECTION */}
          <Section>
            <Text style={sectionTitle}>What you can do here:</Text>
            
            <Row style={row}>
                <Column style={column}>
                    <div style={iconBox}>📚</div>
                    <Text style={featureTitle}>Academic Prep</Text>
                    <Text style={featureText}>Complete resources for SSC & HSC board exams.</Text>
                </Column>
                <Column style={column}>
                    <div style={iconBox}>🎓</div>
                    <Text style={featureTitle}>University Admission</Text>
                    <Text style={featureText}>Targeted guidelines for Medical, Engineering & Varsities.</Text>
                </Column>
            </Row>
            <Row style={row}>
                 <Column style={column}>
                    <div style={iconBox}>💼</div>
                    <Text style={featureTitle}>Job Preparation</Text>
                    <Text style={featureText}> BCS and Bank Job study materials.</Text>
                </Column>
                 <Column style={column}>
                    <div style={iconBox}>📥</div>
                    <Text style={featureTitle}>Digital Library</Text>
                    <Text style={featureText}>Download lecture sheets and PDFs instantly.</Text>
                </Column>
            </Row>
          </Section>

          <Section style={btnSection}>
            <Link style={button} href="https://nextprepbd.com/dashboard">
              Go to Dashboard
            </Link>
          </Section>

          <Text style={footer}>
            © 2026 NextPrepBD. Dhaka, Bangladesh.<br/>
            If you have any questions, reply to this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default WelcomeTemplate;

// --- STYLES ---
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
};

const logoSection = {
  padding: '20px',
  textAlign: 'center' as const,
  borderBottom: '1px solid #eee',
};

const h1 = {
  color: '#0f172a',
  fontSize: '24px',
  fontWeight: '900',
  margin: '0',
};

const heroSection = {
  padding: '40px 40px 20px',
  textAlign: 'center' as const,
};

const heroTitle = {
  color: '#0f172a',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0 0 10px',
};

const text = {
  color: '#475569',
  fontSize: '16px',
  lineHeight: '26px',
};

const sectionTitle = {
    color: '#0f172a',
    fontSize: '18px',
    fontWeight: 'bold',
    textAlign: 'center' as const,
    marginBottom: '20px',
};

const row = {
    marginBottom: '20px',
};

const column = {
    textAlign: 'center' as const,
    padding: '10px',
    width: '50%',
};

const iconBox = {
    fontSize: '32px',
    marginBottom: '10px',
    backgroundColor: '#eff6ff',
    width: '60px',
    height: '60px',
    lineHeight: '60px',
    borderRadius: '50%',
    margin: '0 auto',
};

const featureTitle = {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#1e293b',
    margin: '10px 0 5px',
};

const featureText = {
    fontSize: '13px',
    color: '#64748b',
    margin: '0',
    lineHeight: '1.4',
};

const btnSection = {
  textAlign: 'center' as const,
  marginTop: '32px',
};

const button = {
  backgroundColor: '#2563eb',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 30px',
  boxShadow: '0 4px 10px rgba(37, 99, 235, 0.3)',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  textAlign: 'center' as const,
  marginTop: '40px',
};