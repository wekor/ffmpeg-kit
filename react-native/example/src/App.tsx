import {
  FFmpegKit,
  FFmpegKitConfig,
  type FFmpegSession,
  FFprobeKit,
  Packages,
  ReturnCode,
} from '@wekor/ffmpeg-kit-react-native';
import { File, Paths } from 'expo-file-system';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { Button, ScrollView, StyleSheet, Text, View } from 'react-native';

type Step = { name: string; ok: boolean; detail: string };

/** FFmpeg reads plain paths; expo-file-system hands out `file://` URIs. */
const pathOf = (file: File) =>
  decodeURIComponent(file.uri.replace(/^file:\/\//, ''));

/** Encodes two seconds of FFmpeg's test pattern, then probes the result. */
async function selfTest(onStep: (step: Step) => void) {
  onStep({
    name: 'Version',
    ok: true,
    detail: `FFmpeg ${await FFmpegKitConfig.getFFmpegVersion()}, ${await Packages.getPackageName()}`,
  });

  const output = new File(Paths.cache, 'self-test.mp4');
  if (output.exists) output.delete();

  let lastTime = 0;
  const session = await new Promise<FFmpegSession>((resolve, reject) => {
    FFmpegKit.executeAsync(
      `-f lavfi -i testsrc=duration=2:size=320x240:rate=30 -c:v mpeg4 -y "${pathOf(output)}"`,
      resolve,
      undefined,
      (statistics) => {
        lastTime = statistics.getTime();
      }
    ).catch(reject);
  });
  const returnCode = await session.getReturnCode();
  onStep({
    name: 'Encode',
    ok: ReturnCode.isSuccess(returnCode),
    detail: ReturnCode.isSuccess(returnCode)
      ? `${await session.getDuration()} ms, last progress at ${lastTime} ms`
      : await session.getAllLogsAsString(),
  });

  const probe = await FFprobeKit.getMediaInformation(pathOf(output));
  const information = probe.getMediaInformation();
  onStep({
    name: 'Probe',
    ok: information != null,
    detail:
      information != null
        ? `${information.getFormat()}, ${information.getDuration()} s, ${information
            .getStreams()
            .map((stream) => `${stream.getType()} ${stream.getCodec()}`)
            .join(', ')}`
        : await probe.getAllLogsAsString(),
  });
}

export default function App() {
  const [steps, setSteps] = useState<Step[]>([]);
  const [running, setRunning] = useState(false);

  const run = useCallback(async () => {
    setSteps([]);
    setRunning(true);
    // A release build's result is read off the device: each step is logged (logcat) and all of them are written
    // to Documents/self-test.json (pulled with `xcrun devicectl device copy from` on iOS).
    const results: Step[] = [];
    const report = (step: Step) => {
      console.log(
        `FFMPEG_SELF_TEST ${step.ok ? 'PASS' : 'FAIL'} ${step.name}: ${step.detail}`
      );
      results.push(step);
      setSteps((current) => [...current, step]);
    };
    try {
      await selfTest(report);
    } catch (error) {
      report({ name: 'Error', ok: false, detail: String(error) });
    } finally {
      console.log('FFMPEG_SELF_TEST DONE');
      const resultFile = new File(Paths.document, 'self-test.json');
      resultFile.create({ overwrite: true });
      await resultFile.write(JSON.stringify(results, null, 2));
      setRunning(false);
    }
  }, []);

  useEffect(() => {
    run();
  }, [run]);

  return (
    <View style={styles.screen}>
      <StatusBar style="auto" />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.content}
      >
        <Text style={styles.title}>FFmpeg self-test</Text>
        {steps.map((step) => (
          <View key={step.name} style={styles.step}>
            <Text style={styles.stepName}>
              {step.ok ? '✓' : '✗'} {step.name}
            </Text>
            <Text selectable>{step.detail}</Text>
          </View>
        ))}
        <Button
          title={running ? 'Running…' : 'Run again'}
          disabled={running}
          onPress={run}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, paddingTop: 64, gap: 12 },
  title: { fontSize: 22, fontWeight: '600' },
  step: { gap: 4 },
  stepName: { fontSize: 16, fontWeight: '500' },
});
