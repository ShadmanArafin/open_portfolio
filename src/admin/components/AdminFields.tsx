import React from 'react';
import { TextInput as CoreTextInput } from '@astryxdesign/core/TextInput';
import { TextArea as CoreTextArea } from '@astryxdesign/core/TextArea';
import { Selector as CoreSelector } from '@astryxdesign/core/Selector';
import { Text } from '@astryxdesign/core/Text';
import { VStack } from '@astryxdesign/core/Layout';

/**
 * The editor's form fields.
 *
 * The same Astryx components with the same props, changing one thing: the
 * description sits *under* the control rather than between the label and it.
 *
 * Astryx puts it in the middle, which is fine for a lone field but breaks a row
 * of them — a field with a description pushes its input a line below the field
 * beside it, so nothing in a Grid row lines up. Underneath, every label is one
 * line, so every input in a row starts at the same height, and the hint reads
 * as a footnote to the answer rather than an instruction before it.
 *
 * Each wrapper is cast back to the component it wraps so call sites keep the
 * original type inference — Selector infers its value type from `options`, and
 * a hand-written props type would erase that.
 */

const Hinted: React.FC<{ description?: React.ReactNode; children: React.ReactNode }> = ({
  description,
  children,
}) => (
  <VStack gap={1} width="100%">
    {children}
    {description && (
      <Text type="supporting" display="block">
        {description}
      </Text>
    )}
  </VStack>
);

export const TextInput = ((props: React.ComponentProps<typeof CoreTextInput>) => {
  const { description, ...rest } = props;
  return (
    <Hinted description={description}>
      <CoreTextInput {...(rest as React.ComponentProps<typeof CoreTextInput>)} />
    </Hinted>
  );
}) as typeof CoreTextInput;

export const TextArea = ((props: React.ComponentProps<typeof CoreTextArea>) => {
  const { description, ...rest } = props;
  return (
    <Hinted description={description}>
      <CoreTextArea {...(rest as React.ComponentProps<typeof CoreTextArea>)} />
    </Hinted>
  );
}) as typeof CoreTextArea;

export const Selector = ((props: React.ComponentProps<typeof CoreSelector>) => {
  const { description, ...rest } = props;
  return (
    <Hinted description={description}>
      <CoreSelector {...(rest as React.ComponentProps<typeof CoreSelector>)} />
    </Hinted>
  );
}) as typeof CoreSelector;
