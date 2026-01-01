import * as React from 'react';
import { Html, Body, Container, Section, Text, Button, Heading, Hr } from '@react-email/components';

export default function InvitationEmail({ token, role, inviterName }: { token: string; role: string; inviterName: string }) {
  // Change this URL to your actual domain in production
  const inviteLink = `https://nextprepbd.com/signup?token=${token}&role=${role}`; 

  return (
    <Html>
      <Body style={{ backgroundColor: '#f6f9fc', fontFamily: 'sans-serif' }}>
        <Container style={{ backgroundColor: '#ffffff', margin: '0 auto', padding: '20px 0 48px', borderRadius: '10px' }}>
          <Section style={{ padding: '0 48px' }}>
            <Heading style={{ color: '#333', fontSize: '24px', fontWeight: 'bold', textAlign: 'center' }}>
              NextPrep<span style={{ color: '#2563EB' }}>BD</span> Team Invitation
            </Heading>
            <Hr style={{ borderColor: '#e6ebf1', margin: '20px 0' }} />
            <Text style={{ fontSize: '16px', lineHeight: '24px', color: '#525f7f' }}>
              Hello!
            </Text>
            <Text style={{ fontSize: '16px', lineHeight: '24px', color: '#525f7f' }}>
              <strong>{inviterName || 'Admin'}</strong> has invited you to join the <strong>NextPrepBD</strong> team as a <strong>{role.toUpperCase()}</strong>.
            </Text>
            <Section style={{ textAlign: 'center', marginTop: '32px', marginBottom: '32px' }}>
              <Button
                href={inviteLink}
                style={{ backgroundColor: '#000000', borderRadius: '5px', color: '#fff', fontSize: '16px', fontWeight: 'bold', textDecoration: 'none', textAlign: 'center', display: 'inline-block', padding: '12px 24px' }}
              >
                Accept Invitation
              </Button>
            </Section>
            <Text style={{ fontSize: '14px', color: '#8898aa' }}>
              This link is valid for 7 days. If you were not expecting this invitation, you can ignore this email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}