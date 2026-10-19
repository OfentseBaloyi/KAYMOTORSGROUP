import { MessageCircle, type LucideProps } from "lucide-react";

// lucide-react v1 dropped brand icons, so Instagram is drawn here in the same
// 24px stroke style. WhatsApp uses lucide's speech bubble, always with a label.

export function InstagramIcon({ size = 24, strokeWidth = 2, ...props }: LucideProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </svg>
  );
}

export function WhatsAppIcon(props: LucideProps) {
  return <MessageCircle aria-hidden="true" {...props} />;
}
