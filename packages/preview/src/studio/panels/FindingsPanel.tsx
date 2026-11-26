import { memo, type ReactElement } from "react";
import { Button, Label, Meter } from "react-aria-components";
import { formatPath, type Finding } from "../../findings.js";
import type { Count } from "../../lint/index.js";
import { ErrorIcon, WarningIcon } from "../controls/icons.js";
import { LintState, type OverallState } from "./LintState.js";
import styles from "./FindingsPanel.module.css";

export interface ShownFinding extends Finding {
  /** The path as the file spells it, or undefined for a finding about something the file does not hold (a preview setting on a bare payload). */
  filePath: string | undefined;
}

export interface FindingsPanelProps {
  overall: OverallState;
  /** The renderer's reason, when the scene cannot be drawn. */
  drawProblem: string | undefined;
  findings: readonly ShownFinding[];
  counts: readonly Count[];
  /** Takes the person to a finding's field. Undefined for a finding with nowhere to go (about the input as a whole, or a preview setting). */
  onChoose?: (finding: ShownFinding) => void;
  /** Whether a finding has a field to go to. */
  canChoose?: (finding: ShownFinding) => boolean;
}

const where = (finding: ShownFinding): string =>
  finding.filePath === undefined
    ? `preview setting`
    : finding.filePath === ``
      ? (finding.asset ?? `the input as a whole`)
      : finding.filePath;

/** A finding's message, with its `code` spans drawn as code, as lint writes them for a terminal. */
const Message = ({ text }: { text: string }): ReactElement => (
  <>
    {text.split(`\``).map((part, index) =>
      index % 2 === 1 ? (
        // oxlint-disable-next-line react/no-array-index-key -- the parts of one fixed string, in order.
        <code key={index} className={styles.inlineCode}>
          {part}
        </code>
      ) : (
        part
      )
    )}
  </>
);

const FindingItem = ({
  finding,
  onChoose
}: {
  finding: ShownFinding;
  onChoose: ((finding: ShownFinding) => void) | undefined;
}): ReactElement => {
  const head = (
    <>
      {finding.severity === `error` ? (
        <ErrorIcon className={styles.icon} aria-hidden="true" />
      ) : (
        <WarningIcon className={styles.icon} aria-hidden="true" />
      )}
      <span className={styles.visuallyHidden}>{finding.severity}:</span>
      <code className={styles.code}>{finding.code}</code>
      <code className={styles.path}>{where(finding)}</code>
    </>
  );
  return (
    <li
      className={finding.severity === `error` ? styles.error : styles.warning}
    >
      {onChoose === undefined ? (
        <div className={styles.findingHead}>{head}</div>
      ) : (
        // Choosing a finding takes the person to the field it is about, in the editor.
        <Button
          className={styles.findingButton}
          onPress={() => onChoose(finding)}
          aria-label={`${finding.severity} ${finding.code} at ${where(finding)}: go to the field`}
        >
          {head}
        </Button>
      )}
      <p className={styles.message}>
        <Message text={finding.message} />
      </p>
    </li>
  );
};

const CountMeter = ({ count }: { count: Count }): ReactElement => {
  const over = count.used > count.limit;
  const path = formatPath(count.path);
  return (
    <Meter
      className={over ? styles.meterOver : styles.meter}
      value={Math.min(count.used, count.limit)}
      maxValue={count.limit}
      valueLabel={count.summary}
    >
      {({ percentage, valueText }) => (
        <>
          <div className={styles.meterHead}>
            <Label className={styles.meterLabel}>{valueText}</Label>
            {path === `` ? null : (
              <code className={styles.meterPath}>{path}</code>
            )}
          </div>
          <div className={styles.track}>
            <div
              className={styles.fill}
              style={{ width: `${String(percentage)}%` }}
            />
          </div>
        </>
      )}
    </Meter>
  );
};

/** What `lint` says about the scene: the overall state, every finding with where it is in the file, and how much of each of Discord's limits is used. */
export const FindingsPanel = memo(function FindingsPanel({
  overall,
  drawProblem,
  findings,
  counts,
  onChoose,
  canChoose
}: FindingsPanelProps): ReactElement {
  return (
    <div className={styles.panel}>
      <output className={styles.summary}>
        <LintState overall={overall} />
      </output>
      {drawProblem === undefined ? null : (
        <p className={styles.drawProblem}>
          <strong>The renderer refused this scene.</strong> {drawProblem}
        </p>
      )}
      {findings.length === 0 ? (
        <p className={styles.none}>
          No findings: Discord would accept this as written, and nothing in it
          looks unintended.
        </p>
      ) : (
        <ul className={styles.list} aria-label="Findings">
          {findings.map((finding, index) => (
            // oxlint-disable-next-line react/no-array-index-key -- two findings can share a code and path; their order is lint's.
            <FindingItem
              key={`${String(index)}:${finding.code}`}
              finding={finding}
              onChoose={canChoose?.(finding) === true ? onChoose : undefined}
            />
          ))}
        </ul>
      )}
      {counts.length === 0 ? null : (
        <section className={styles.counts} aria-label="Limits">
          <h3 className={styles.subheading}>Limits</h3>
          {counts.map((count) => (
            <CountMeter
              key={`${count.metric}:${formatPath(count.path)}`}
              count={count}
            />
          ))}
        </section>
      )}
    </div>
  );
});
