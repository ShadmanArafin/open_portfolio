'use client';

import React, { useState } from 'react';
import { TextInput } from '../components/AdminFields';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '@astryxdesign/core/Card';
import { Button } from '@astryxdesign/core/Button';
import { Banner } from '@astryxdesign/core/Banner';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Link } from '@astryxdesign/core/Link';
import { VStack } from '@astryxdesign/core/Layout';
import { Center } from '@astryxdesign/core/Center';
import { Mail, Lock } from 'lucide-react';
import { cmsService } from '../../cms/services/cmsService';
import { AdminSurface } from '../components/AdminSurface';

/**
 * Passphrase reset, in two states switched by one query param.
 *
 * No `?token=` — ask for an email and POST it to `/api/auth/reset/request`.
 * That endpoint answers `{ ok: true }` whether or not the address owns this
 * site, so the screen after submitting must say the same thing either way:
 * showing anything else would let this form be used to test who runs a site.
 *
 * `?token=...` present — ask for a new passphrase and POST both to
 * `/api/auth/reset/confirm`. That route sets the session cookie itself; this
 * only has to bring the browser's cached auth state in line with it before
 * leaving the page, the same way `AdminLogin` does after a normal sign-in.
 */
export const AdminResetPassphrase: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [requested, setRequested] = useState(false);

  // A plain <a>, not router-aware — Astryx's Link has no LinkProvider wired
  // to react-router here. An unqualified href="/login" would leave the
  // basename="/admin" router entirely and 404 at the site root's /login. The
  // onClick keeps it a real, fully-qualified link (right-click, new tab,
  // no-JS all still work) while giving it a client-side transition on an
  // ordinary click.
  const goToLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/login');
  };

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!data.ok) {
        setError(data.error ?? 'That did not work.');
        return;
      }
      setRequested(true);
    } catch {
      setError('Could not reach the server.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, passphrase }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!data.ok) {
        setError(data.error ?? 'That did not work.');
        return;
      }
      await cmsService.refreshAuth();
      navigate('/');
    } catch {
      setError('Could not reach the server.');
    } finally {
      setLoading(false);
    }
  };

  if (token) {
    return (
      <AdminSurface className="min-h-screen">
        <Center height="100vh" padding={4}>
          <Card maxWidth={420} padding={6}>
            <form onSubmit={handleConfirm}>
              <VStack gap={5}>
                <VStack gap={1}>
                  <Heading level={1}>Choose a new passphrase</Heading>
                  <Text type="supporting" display="block">
                    This link works once. Setting a passphrase signs you in here and signs out every
                    other session.
                  </Text>
                </VStack>

                {error && <Banner status="error" title={error} />}

                <TextInput
                  label="New passphrase"
                  type="password"
                  value={passphrase}
                  onChange={(value) => setPassphrase(value)}
                  startIcon={Lock}
                  isRequired
                  hasAutoFocus
                  width="100%"
                  description="At least 12 characters. A short sentence works well."
                />

                <Button
                  label={loading ? 'Saving' : 'Set passphrase and sign in'}
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={loading}
                  width="100%"
                />

                <Center>
                  <Link href="/admin/login" onClick={goToLogin}>
                    Back to sign in
                  </Link>
                </Center>
              </VStack>
            </form>
          </Card>
        </Center>
      </AdminSurface>
    );
  }

  return (
    <AdminSurface className="min-h-screen">
      <Center height="100vh" padding={4}>
        <Card maxWidth={420} padding={6}>
          {requested ? (
            <VStack gap={5}>
              <VStack gap={1}>
                <Heading level={1}>Check your email</Heading>
                <Text type="supporting" display="block">
                  If that address owns this site, a reset link is on its way. It works once, for 30
                  minutes.
                </Text>
              </VStack>

              <Center>
                <Link href="/admin/login" onClick={goToLogin}>
                  Back to sign in
                </Link>
              </Center>
            </VStack>
          ) : (
            <form onSubmit={handleRequest}>
              <VStack gap={5}>
                <VStack gap={1}>
                  <Heading level={1}>Reset your passphrase</Heading>
                  <Text type="supporting" display="block">
                    Enter the email you used to claim this site.
                  </Text>
                </VStack>

                {error && <Banner status="error" title={error} />}

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

                <Button
                  label={loading ? 'Sending' : 'Send reset link'}
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={loading}
                  width="100%"
                />

                <Center>
                  <Link href="/admin/login" onClick={goToLogin}>
                    Back to sign in
                  </Link>
                </Center>
              </VStack>
            </form>
          )}
        </Card>
      </Center>
    </AdminSurface>
  );
};
