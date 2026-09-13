import { formatPlate } from '../utils/format.js';

// Styled like a physical Indian RTO plate — deliberately not theme-aware,
// the same way a real plate looks the same whether it's day or night.
export function PlateBadge({ plate }) {
  return (
    <span className="plate">
      <span className="plate-strip">IND</span>
      <span className="plate-num">{formatPlate(plate)}</span>
    </span>
  );
}
