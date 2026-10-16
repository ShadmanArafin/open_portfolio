'use client';

import { DEMO_EMAIL, DEMO_PASSPHRASE, isDemoMode } from '@/core/demo/config';
import React, { useState } from 'react';
import { TextInput } from '../components/AdminFields';
import { useNavigate } from 'react-router-dom';
import { Card } from '@astryxdesign/core/Card';
import { Button } from '@astryxdesign/core/Button';
import { Banner } from '@astryxdesign/core/Banner';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Link } from '@astryxdesign/core/Link';
import { VStack } from '@astryxdesign/core/Layout';
import { Center } from '@astryxdesign/core/Center';
import { Mail, Lock } from 'lucide-react';
import { useCMS } from '../../cms/context/CMSContext';
import { AdminSurface } from '../components/AdminSurface';

export const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [passkeyBusy, setPasskeyBusy] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpBusy, setOtpBusy] = useState(false);
  const [otpStatus, setOtpStatus] = useState<string | null>(null);

  const { login } = useCMS();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        navigate('/');
      } else {
        setError(res.error || 'Invalid email or passcode.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasskey = async () => {
    setError(null);
    if (typeof window === 'undefined' || !window.PublicKeyCredential) {
      setError('This browser cannot use passkeys.');
      return;
    }
    setPasskeyBusy(true);
    try {
      const { startAuthentication } = await import('@simplewebauthn/browser');
      const start = await (await fetch('/api/auth/passkey/login/start', { method: 'POST' })).json();
      if (!start.ok) {
        setError(start.error ?? 'Passkey sign-in failed.');
        return;
      }
      const assertion = await startAuthentication({ optionsJSON: start.options });
      const finish = await (
        await fetch('/api/auth/passkey/login/finish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ challengeId: start.challengeId, response: assertion }),
        })
      ).json();
      if (finish.ok) {
        navigate('/');
      } else {
        setError(finish.error ?? 'Passkey sign-in failed.');
      }
    } catch (err) {
      if (!(err instanceof Error && err.name === 'NotAllowedError')) {
        setError('Passkey sign-in failed.');
      }
    } finally {
      setPasskeyBusy(false);
    }
  };

  const handleOtpRequest = async () => {
    setOtpStatus(null);
    setError(null);
    if (!email.trim()) {
      setOtpStatus('Enter your email above first.');
      return;
    }
    setOtpBusy(true);
    try {
      await fetch('/api/auth/otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      // Always "sent": the endpoint answers identically whether or not the
      // address owns this site, so this screen cannot leak that either.
      setOtpSent(true);
      setOtpStatus(
        'If email is connected, a code is on its way. It works once, within 10 minutes.'
      );
    } finally {
      setOtpBusy(false);
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpBusy(true);
    try {
      const res = await (
        await fetch('/api/auth/otp/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), code: otpCode }),
        })
      ).json();
      if (res.ok) {
        navigate('/');
      } else {
        setOtpStatus(res.error ?? 'That code is not right.');
      }
    } finally {
      setOtpBusy(false);
    }
  };

  return (
    <AdminSurface className="min-h-screen">
      <Center height="100vh" padding={4}>
        <Card maxWidth={420} padding={6}>
          <form onSubmit={handleSubmit}>
            <VStack gap={5}>
              <VStack gap={1}>
                <Heading level={1}>Sign in</Heading>
                <Text type="supporting" display="block">
                  {/* This used to say "from your .env.local file", from the
                      days when the passcode was compiled into the public
                      bundle. There is no such file and no such passcode now:
                      the owner sets these when they claim the site. */}
                  {isDemoMode()
                    ? `Demo — sign in with ${DEMO_EMAIL} and ${DEMO_PASSPHRASE}.`
                    : 'Use the email and passphrase you chose when you set this site up.'}
                </Text>
              </VStack>

              {error && <Banner status="error" title={error} />}

              <VStack gap={4}>
                <TextInput
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(value) => setEmail(value)}
                  startIcon={Mail}
                  isRequired
                  hasAutoFocus
                  width="100%"
                />

                <TextInput
                  label="Passphrase"
                  type="password"
                  value={password}
                  onChange={(value) => setPassword(value)}
                  startIcon={Lock}
                  isRequired
                  width="100%"
                />
              </VStack>

              <Button
                label={loading ? 'Signing in' : 'Sign in'}
                type="submit"
                variant="primary"
                size="lg"
                isLoading={loading}
                width="100%"
              />

              <Button
                label={passkeyBusy ? 'Waiting for your key' : 'Sign in with a passkey'}
                type="button"
                variant="secondary"
                size="lg"
                width="100%"
                onClick={() => void handlePasskey()}
              />

              {!otpSent ? (
                <Center>
                  <Link
                    href="/admin/login"
                    onClick={(e) => {
                      e.preventDefault();
                      void handleOtpRequest();
                    }}
                  >
                    {otpBusy ? 'Sending…' : 'Email me a sign-in code instead'}
                  </Link>
                </Center>
              ) : (
                <form onSubmit={(e) => void handleOtpVerify(e)}>
                  <VStack gap={3}>
                    <TextInput
                      label="6-digit code"
                      value={otpCode}
                      onChange={(value) => setOtpCode(value)}
                      width="100%"
                    />
                    <Button
                      label={otpBusy ? 'Checking' : 'Use this code'}
                      type="submit"
                      variant="secondary"
                      size="lg"
                      isLoading={otpBusy}
                      width="100%"
                    />
                  </VStack>
                </form>
              )}
              {otpStatus && (
                <Text type="supporting" display="block">
                  {otpStatus}
                </Text>
              )}

              <Center>
                {/* A plain <a>, not router-aware — Astryx's Link has no
                    LinkProvider wired to react-router here. An unqualified
                    href="/reset" would leave the basename="/admin" router
                    entirely and 404 at the site root's /reset. The onClick
                    keeps it a real, fully-qualified link (right-click, new
                    tab, no-JS all still work) while giving it a client-side
                    transition on an ordinary click. */}
                <Link
                  href="/admin/reset"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/reset');
                  }}
                >
                  Forgot your passphrase?
                </Link>
              </Center>

              <Center>
                <Link href="/">Back to the site</Link>
              </Center>
            </VStack>
          </form>
        </Card>
      </Center>
    </AdminSurface>
  );
};
