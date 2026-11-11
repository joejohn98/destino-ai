import { api } from "@/lib/api";

export function OAuthButtons({ dividerLabel }: { dividerLabel: string }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => window.location.assign(api.oauthUrl("google"))}
          className="inline-flex items-center justify-center gap-2.5 rounded-xl border border-[#dfe2dc] bg-white py-2.5 text-xs font-semibold text-[#18251f] shadow-xs transition hover:border-[#e8a83e] hover:bg-[#faf9f6]"
        >
          <svg className="size-4" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5c1.55 0 2.94.55 4.04 1.45l3.03-3.03C17.24 1.7 14.77 1 12 1 7.42 1 3.53 3.6 1.71 7.37l3.7 2.87C6.3 7.47 8.9 5 12 5z"
            />
            <path
              fill="#4285F4"
              d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.7 2.87c2.16-1.99 3.72-4.93 3.72-8.69z"
            />
            <path
              fill="#FBBC05"
              d="M5.41 14.76c-.23-.68-.36-1.41-.36-2.16s.13-1.48.36-2.16L1.71 7.57C.62 9.74 0 12.18 0 14.76s.62 5.02 1.71 7.19l3.7-2.87z"
            />
            <path
              fill="#34A853"
              d="M12 23.5c3.24 0 5.95-1.08 7.93-2.91l-3.7-2.87c-1.08.72-2.45 1.16-4.23 1.16-3.1 0-5.7-2.47-6.59-5.24L1.71 16.5C3.53 20.27 7.42 23.5 12 23.5z"
            />
          </svg>
          Google
        </button>

        <button
          type="button"
          onClick={() => window.location.assign(api.oauthUrl("github"))}
          className="inline-flex items-center justify-center gap-2.5 rounded-xl border border-[#dfe2dc] bg-white py-2.5 text-xs font-semibold text-[#18251f] shadow-xs transition hover:border-[#e8a83e] hover:bg-[#faf9f6]"
        >
          <svg
            className="size-4 fill-current"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.56.1.76-.24.76-.54v-2.08c-3.1.67-3.76-1.31-3.76-1.31-.51-1.3-1.24-1.65-1.24-1.65-1.01-.69.08-.68.08-.68 1.12.08 1.71 1.15 1.71 1.15 1 1.71 2.62 1.22 3.26.93.1-.72.39-1.22.71-1.5-2.48-.28-5.09-1.24-5.09-5.53 0-1.22.44-2.22 1.15-3-.12-.28-.5-1.42.11-2.96 0 0 .94-.3 3.05 1.15a10.6 10.6 0 0 1 5.55 0c2.11-1.45 3.05-1.15 3.05-1.15.61 1.54.23 2.68.11 2.96.72.78 1.15 1.78 1.15 3 0 4.3-2.61 5.25-5.1 5.52.4.35.76 1.03.76 2.08v3.08c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z" />
          </svg>
          GitHub
        </button>
      </div>

      <div className="relative flex items-center justify-center">
        <div className="w-full border-t border-[#dfe2dc]" />
        <span className="absolute bg-[#faf9f6] px-3 text-xs font-medium text-[#657069]">
          {dividerLabel}
        </span>
      </div>
    </>
  );
}

