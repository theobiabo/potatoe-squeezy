import { buildTipBadgeClickUrl, buildTipBadgeUrl } from "@potatoe/utils";
import { BASE_API_URL } from "@/constant";

interface TipBadgeProps {
  username: string;
}

export function TipBadge({ username }: TipBadgeProps) {
  return (
    <a
      className=""
      href={buildTipBadgeClickUrl(username, BASE_API_URL)}
      target="_blank"
      rel="noopener noreferrer"
    >
      <img
        src={buildTipBadgeUrl(username, BASE_API_URL)}
        width="420"
        height="96"
        style={{ width: "420px", maxWidth: "100%", height: "96px" }}
        alt={`Tip ${username} on Potatoe Squeezy`}
      />
    </a>
  );
}
