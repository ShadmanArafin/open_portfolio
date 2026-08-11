'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Badge } from '@astryxdesign/core/Badge';
import { Banner } from '@astryxdesign/core/Banner';
import { Button } from '@astryxdesign/core/Button';
import { Divider } from '@astryxdesign/core/Divider';
import { HStack, VStack } from '@astryxdesign/core/Layout';
import { Link } from '@astryxdesign/core/Link';
import { Switch } from '@astryxdesign/core/Switch';
import { Text } from '@astryxdesign/core/Text';
import { AdminRecord, AdminRecordList } from '../components/AdminRecord';
import { AstryxHeader } from '../components/astryx/AstryxComponents';
import { TextInput } from '../components/AdminFields';

/**
 * One screen for every service.
 *
 * Not one screen per service. Every integration is described by the same data
 * — fields, setup steps, a free-tier note, a test — so the twenty-fifth one is
 * a definition file and nothing here changes. The alternative is twenty-five
 * screens that drift, and twenty-five chances to forget the test button.
 *
 * Three things are on screen that a settings page usually leaves out, and each
 * is here because the person reading it is not a developer:
 *
 * - **What it costs**, with the date somebody last checked. A free-tier claim
 *   with no date on it is a rumour.
 * - **What breaks without it**, in plain words. "Optional" tells you nothing
 *   about whether to bother.
 * - **A test button**, because "saved" is not "works", and finding out which at
 *   the moment a stranger sends you a message is too late.
 */

interface IntegrationView {
  id: string;
  name: string;
  category: string;
  summary: string;
  freeTier: { summary: string; verifiedOn: string };
  docsUrl?: string;
  setup: string[];
  fields: {
    name: string;
    label: string;
    help?: string;
    kind: 'text' | 'password' | 'number' | 'toggle';
    placeholder?: string;
    optional?: boolean;
  }[];
  secretFields: string[];
  degradation: string;
  configuredByEnv: boolean;
  isConfigured: boolean;
  values: Record<string, unknown>;
  secrets: Record<string, { isSet: boolean; hint?: string }>;
}

export const AdminIntegrations: React.FC = () => {
  const [integrations, setIntegrations] = useState<IntegrationView[] | null>(null);
  const [vaultAvailable, setVaultAvailable] = useState(true);
  const [edits, setEdits] = useState<Record<string, Record<string, unknown>>>({});
  const [results, setResults] = useState<Record<string, { ok: boolean; message: string }>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const form = useRef<HTMLFormElement>(null);

  const load = async () => {
    const res = await fetch('/api/admin/integrations');
    const data = await res.json().catch(() => null);
    if (data?.ok) {
      setIntegrations(data.integrations);
      setVaultAvailable(data.vaultAvailable);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  /*
   * Keep the browser's password manager out of these fields.
   *
   * Found by using the screen: Chrome saw a password field on a site it had a
   * login for and filled the owner's own admin passphrase in as the SMTP
   * password. Pressing Save there would have stored the passphrase to this
   * site as a credential for somebody else's mail server.
   *
   * Set on the DOM rather than passed as a prop, because Astryx inputs accept
   * `React.HTMLAttributes`, which has no `autoComplete`. `new-password` is the
   * value Chrome actually honours; plain `off` it frequently ignores.
   *
   * Watched rather than applied once: these inputs do not exist until somebody
   * expands a service, so an effect keyed on the data runs before there is
   * anything to mark. The first version of this did exactly that and marked
   * nothing at all — visible only by reading the attributes in a browser.
   */
  useEffect(() => {
    const root = form.current;
    if (!root) return;

    const mark = () => {
      for (const input of root.querySelectorAll('input')) {
        input.setAttribute('autocomplete', input.type === 'password' ? 'new-password' : 'off');
      }
    };

    mark();
    const observer = new MutationObserver(mark);
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [integrations]);

  const valueOf = (item: IntegrationView, name: string): unknown =>
    edits[item.id]?.[name] ?? item.values[name] ?? '';

  const edit = (id: string, name: string, value: unknown) =>
    setEdits((current) => ({ ...current, [id]: { ...current[id], [name]: value } }));

  /**
   * Every field, in the shape the integration declared — not only the ones
   * somebody touched.
   *
   * A toggle nobody moved sends nothing, and a schema that requires a boolean
   * rejects the lot. That made a brand-new integration impossible to save until
   * the user happened to flick a switch back and forth, with "fill in the
   * settings above first" as the only explanation. Found by using the screen.
   */
  const payloadFor = (item: IntegrationView): Record<string, unknown> => {
    const out: Record<string, unknown> = {};
    for (const field of item.fields) {
      const value = valueOf(item, field.name);
      if (field.kind === 'toggle') out[field.name] = Boolean(value);
      else if (field.kind === 'number') out[field.name] = Number(value) || undefined;
      else out[field.name] = String(value ?? '');
    }
    return out;
  };

  const send = async (item: IntegrationView, method: 'PUT' | 'POST') => {
    setBusy(item.id);
    try {
      const res = await fetch('/api/admin/integrations', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, values: payloadFor(item) }),
      });
      const data = (await res.json().catch(() => null)) as {
        ok?: boolean;
        error?: string;
        result?: { ok: boolean; message: string };
      } | null;

      if (method === 'POST') {
        setResults((r) => ({
          ...r,
          [item.id]: data?.result ?? { ok: false, message: data?.error ?? 'The test did not run.' },
        }));
        return;
      }

      if (!data?.ok) {
        setResults((r) => ({
          ...r,
          [item.id]: { ok: false, message: data?.error ?? 'Could not save those settings.' },
        }));
        return;
      }

      setResults((r) => ({ ...r, [item.id]: { ok: true, message: 'Saved.' } }));
      setEdits((current) => ({ ...current, [item.id]: {} }));
      await load();
    } finally {
      setBusy(null);
    }
  };

  const disconnect = async (item: IntegrationView) => {
    setBusy(item.id);
    try {
      await fetch(`/api/admin/integrations?id=${encodeURIComponent(item.id)}`, {
        method: 'DELETE',
      });
      setResults((r) => ({ ...r, [item.id]: { ok: true, message: 'Disconnected.' } }));
      await load();
    } finally {
      setBusy(null);
    }
  };

  return (
    <VStack gap={6}>
      <AstryxHeader
        title="Services"
        subtitle="Optional things this site can connect to. Everything here has a free plan, and the site keeps working without any of them."
      />

      {!vaultAvailable && (
        <Banner
          status="warning"
          title="This site cannot store passwords safely yet"
          description="Set OPB_SECRET_KEY in your hosting provider's environment variables and restart. Until then, anything with a password has to be configured through environment variables instead."
        />
      )}

      {/* A real <form>, so `autocomplete="off"` has something to sit on and a
          stray Enter key does not reload the page. Submitting is done by the
          buttons; each one means something different. */}
      {integrations === null ? (
        <Text type="supporting" display="block">
          Loading…
        </Text>
      ) : (
        <form ref={form} autoComplete="off" onSubmit={(event) => event.preventDefault()}>
          <AdminRecordList>
            {integrations.map((item) => {
              const result = results[item.id];
              return (
                <AdminRecord
                  key={item.id}
                  value={item.id}
                  title={item.name}
                  summary={item.summary}
                  badge={
                    item.configuredByEnv
                      ? 'Set by environment'
                      : item.isConfigured
                        ? 'On'
                        : 'Not set'
                  }
                  badgeVariant={item.isConfigured ? 'green' : 'outline'}
                >
                  <VStack gap={5}>
                    <Banner
                      status="info"
                      title={item.freeTier.summary}
                      description={`Checked on ${item.freeTier.verifiedOn}. Free plans change — if this looks wrong, please open an issue.`}
                    />

                    <VStack gap={1}>
                      <Text type="label" display="block">
                        Without this
                      </Text>
                      <Text type="supporting" display="block">
                        {item.degradation}
                      </Text>
                    </VStack>

                    {item.setup.length > 0 && (
                      <VStack gap={2}>
                        <Text type="label" display="block">
                          How to set it up
                        </Text>
                        {/* Numbered on purpose: these are steps to follow in
                          order, and a bulleted list of four things does not say
                          that. Plain <ol> rather than a component because a list
                          of instructions is exactly what the element is for. */}
                        <ol style={{ margin: 0, paddingInlineStart: '1.25rem' }}>
                          {item.setup.map((step, i) => (
                            <li key={i}>
                              <Text type="supporting">{step}</Text>
                            </li>
                          ))}
                        </ol>
                        {item.docsUrl && (
                          <Link href={item.docsUrl} target="_blank" rel="noreferrer noopener">
                            Open the provider's page
                          </Link>
                        )}
                      </VStack>
                    )}

                    <Divider />

                    {item.configuredByEnv ? (
                      <Banner
                        status="info"
                        title="Configured by environment variables"
                        description="Whoever deployed this site set these on the host, and those win. Change them there, or remove them to manage this here instead."
                      />
                    ) : (
                      <VStack gap={4}>
                        {item.fields.map((field) => {
                          const secret = item.secrets[field.name];
                          if (field.kind === 'toggle') {
                            return (
                              <Switch
                                key={field.name}
                                label={field.label}
                                description={field.help}
                                value={Boolean(valueOf(item, field.name))}
                                onChange={(checked) => edit(item.id, field.name, checked)}
                              />
                            );
                          }
                          return (
                            <TextInput
                              key={field.name}
                              label={field.label}
                              htmlName={`${item.id}-${field.name}`}
                              type={field.kind === 'password' ? 'password' : 'text'}
                              placeholder={
                                // A password is never sent back, so the field
                                // starts empty and its placeholder says what is
                                // already stored. Leaving it alone keeps it.
                                secret?.isSet
                                  ? `${secret.hint} — leave blank to keep`
                                  : field.placeholder
                              }
                              value={String(valueOf(item, field.name) ?? '')}
                              description={field.help}
                              onChange={(value) =>
                                edit(
                                  item.id,
                                  field.name,
                                  field.kind === 'number' ? Number(value) || '' : value
                                )
                              }
                            />
                          );
                        })}

                        {result && (
                          <Banner
                            status={result.ok ? 'success' : 'warning'}
                            title={result.message}
                          />
                        )}

                        <HStack gap={2}>
                          <Button
                            variant="primary"
                            label={busy === item.id ? 'Working…' : 'Save'}
                            isDisabled={busy === item.id}
                            onClick={() => void send(item, 'PUT')}
                          />
                          <Button
                            variant="secondary"
                            label="Test"
                            isDisabled={busy === item.id}
                            onClick={() => void send(item, 'POST')}
                          />
                          {item.isConfigured && (
                            <Button
                              variant="ghost"
                              label="Disconnect"
                              isDisabled={busy === item.id}
                              onClick={() => void disconnect(item)}
                            />
                          )}
                        </HStack>
                      </VStack>
                    )}

                    <HStack gap={2}>
                      <Badge variant="neutral" label={item.category} />
                    </HStack>
                  </VStack>
                </AdminRecord>
              );
            })}
          </AdminRecordList>
        </form>
      )}
    </VStack>
  );
};
