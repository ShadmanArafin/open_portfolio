'use client';

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
                  Use the email and passphrase you chose when you set this site up.
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
