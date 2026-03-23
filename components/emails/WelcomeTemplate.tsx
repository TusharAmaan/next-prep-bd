import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
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
  role?: string;
}

export const WelcomeTemplate = ({ userFirstname, role = 'student' }: WelcomeEmailProps) => {
  const isTutor = role === 'tutor';
  const isInstitute = role === 'institute';

  return (
    <Html>
      <Head />
      <Preview>Welcome to NextPrepBD - Your Professional Exam Partner</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* STYLIZED LOGO */}
          <Section style={logoSection}>
             <Heading style={h1}>NextPrep<span style={{color: '#2563eb'}}>BD</span></Heading>
             <Text style={tagline}>The Future of Excellence</Text>
          </Section>

          <Section style={heroSection}>
            <Heading style={heroTitle}>Welcome, {userFirstname}!</Heading>
            <Text style={text}>
              {isTutor 
                ? "We're excited to have a professional educator like you on board. Let's start building your digital classroom." 
                : isInstitute 
                ? "Welcome to the NextPrepBD Institutional Hub. We're ready to help you digitize your management and results."
                : "We are thrilled to have you join NextPrepBD. You've just taken a massive step towards mastering your academic goals."}
            </Text>
          </Section>

          <Hr style={hr} />

          {/* ROLE-SPECIFIC GUIDES */}
          <Section style={contentSection}>
            <Text style={sectionTitle}>Your First Steps:</Text>
            
            <Row style={row}>
                <Column style={column}>
                    <div style={iconBox}>{isTutor ? '🛠️' : isInstitute ? '👥' : '📚'}</div>
                    <Text style={featureTitle}>{isTutor ? 'Exam Builder' : isInstitute ? 'Member Hub' : 'Study Resources'}</Text>
                    <Text style={featureText}>
                      {isTutor ? 'Compose professional papers in minutes.' : isInstitute ? 'Manage your students and batches.' : 'Access SSC, HSC, and Admission materials.'}
                    </Text>
                </Column>
                <Column style={column}>
                    <div style={iconBox}>{isTutor ? '📊' : isInstitute ? '📈' : '📝'}</div>
                    <Text style={featureTitle}>{isTutor ? 'Analytics' : isInstitute ? 'Analytics' : 'Mock Tests'}</Text>
                    <Text style={featureText}>
                      {isTutor ? 'Track how students engage with your content.' : isInstitute ? 'Detailed performance reports for your center.' : 'Practice with thousands of MCQ and CQ questions.'}
                    </Text>
                </Column>
            </Row>
          </Section>

          <Section style={btnSection}>
            <Link style={button} href={`https://nextprepbd.com/${isTutor ? 'tutor' : isInstitute ? 'institution' : 'student'}/dashboard`}>
              Open My Dashboard
            </Link>
          </Section>

          <Hr style={hr} />

          {/* CONTACT SECTION */}
          <Section style={contactSection}>
            <Text style={contactTitle}>Need Support?</Text>
            <Text style={contactText}>
              Our team is here to help you 24/7.
            </Text>
            <Row style={{ marginTop: '10px' }}>
                <Column align="center">
                    <Link href="https://wa.me/8801619663933" style={contactLink}>
                        🟢 WhatsApp: +8801619663933
                    </Link>
                </Column>
            </Row>
            <Row>
                <Column align="center">
                    <Link href="mailto:nextprepbd@gmail.com" style={contactLink}>
                        📧 Email: nextprepbd@gmail.com
                    </Link>
                </Column>
            </Row>
          </Section>

          <Text style={footer}>
            © 2026 NextPrepBD. Dhaka, Bangladesh.<br/>
            Premium Platform for Competitive Excellence.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default WelcomeTemplate;

// --- STYLES ---
const main = {
  backgroundColor: '#f8fafc',
  fontFamily: 'Inter, -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '40px auto',
  padding: '0',
  maxWidth: '600px',
  borderRadius: '16px',
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
  overflow: 'hidden',
};

const logoSection = {
  padding: '30px',
  textAlign: 'center' as const,
  backgroundColor: '#ffffff',
  borderBottom: '1px solid #f1f5f9',
};

const h1 = {
  color: '#0f172a',
  fontSize: '28px',
  fontWeight: '900',
  margin: '0',
  letterSpacing: '-0.5px',
};

const tagline = {
    color: '#64748b',
    fontSize: '12px',
    fontWeight: '700',
    textTransform: 'uppercase' as const,
    letterSpacing: '2px',
    margin: '5px 0 0',
};

const heroSection = {
  padding: '40px 40px 20px',
  textAlign: 'center' as const,
};

const heroTitle = {
  color: '#0f172a',
  fontSize: '32px',
  fontWeight: '900',
  margin: '0 0 15px',
  letterSpacing: '-1px',
};

const text = {
  color: '#475569',
  fontSize: '16px',
  lineHeight: '28px',
  margin: '0',
};

const contentSection = {
    padding: '0 40px 20px',
};

const sectionTitle = {
    color: '#0f172a',
    fontSize: '20px',
    fontWeight: '800',
    textAlign: 'center' as const,
    marginBottom: '30px',
};

const row = {
    marginBottom: '0',
};

const column = {
    textAlign: 'center' as const,
    padding: '10px',
    width: '50%',
};

const iconBox = {
    fontSize: '40px',
    marginBottom: '15px',
    backgroundColor: '#f1f5f9',
    width: '72px',
    height: '72px',
    lineHeight: '72px',
    borderRadius: '24px',
    margin: '0 auto',
};

const featureTitle = {
    fontSize: '16px',
    fontWeight: '800',
    color: '#1e293b',
    margin: '10px 0 8px',
};

const featureText = {
    fontSize: '14px',
    color: '#64748b',
    margin: '0',
    lineHeight: '1.5',
};

const btnSection = {
  textAlign: 'center' as const,
  padding: '20px 40px 40px',
};

const button = {
  backgroundColor: '#2563eb',
  borderRadius: '12px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '800',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '16px 40px',
  boxShadow: '0 10px 20px rgba(37, 99, 235, 0.2)',
};

const hr = {
  borderColor: '#f1f5f9',
  margin: '0',
};

const contactSection = {
    padding: '30px 40px',
    backgroundColor: '#f8fafc',
    textAlign: 'center' as const,
};

const contactTitle = {
    color: '#1e293b',
    fontSize: '18px',
    fontWeight: '800',
    margin: '0 0 5px',
};

const contactText = {
    color: '#64748b',
    fontSize: '14px',
    margin: '0 0 15px',
};

const contactLink = {
    color: '#2563eb',
    fontSize: '14px',
    fontWeight: '700',
    textDecoration: 'none',
    display: 'block',
    margin: '5px 0',
};

const footer = {
  color: '#94a3b8',
  fontSize: '12px',
  lineHeight: '20px',
  textAlign: 'center' as const,
  padding: '40px',
  backgroundColor: '#ffffff',
};