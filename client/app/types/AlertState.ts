export type AlertState = {
  type: "success" | "error";
  message: string;
} | null;
