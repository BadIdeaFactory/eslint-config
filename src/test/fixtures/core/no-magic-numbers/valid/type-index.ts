type Callback = (error: Error, value: string, attempt: number) => void;
type Attempt = Parameters<Callback>[2];
