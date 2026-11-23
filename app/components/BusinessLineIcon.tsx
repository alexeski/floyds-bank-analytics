import type { BusinessLine } from "./sampleData";
import {
  BriefcaseIcon,
  CardIcon,
  CheckingIcon,
  HomeLoanIcon,
  SavingsIcon,
  WealthIcon,
} from "./icons";

const ICONS = {
  current: CheckingIcon,
  savings: SavingsIcon,
  cards: CardIcon,
  lending: HomeLoanIcon,
  business: BriefcaseIcon,
  wealth: WealthIcon,
} as const;

export default function BusinessLineIcon({
  line,
  className,
}: {
  line: BusinessLine["key"];
  className?: string;
}) {
  const Icon = ICONS[line];
  return <Icon className={className} />;
}
