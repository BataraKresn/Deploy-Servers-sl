import { type NextRequest, NextResponse } from "next/server"

// Determine backend URL from environment variables
const BACKEND_API_URL =
  process.env.BACKEND_API_URL ??
  process.env.NEXT_PUBLIC_BACKEND_API_URL ??
  (globalThis as any).BACKEND_API_URL ??
  (globalThis as any).NEXT_PUBLIC_BACKEND_API_URL ??
  ""

async function handler(req: NextRequest) {
  const path = req.nextUrl.pathname
  const search = req.nextUrl.search
  const apiUrl = `${BACKEND_API_URL}${path}${search}`

  const fetchOptions: RequestInit | any = {
    method: req.method,
    headers: Object.fromEntries(req.headers.entries()),
    body: req.method !== "GET" && req.method !== "HEAD" ? req.body : null,
  }

  // Tambahkan duplex untuk streaming
  if (path.includes("/api/stream-log")) {
    fetchOptions.duplex = "half"
  }

  // Tambahkan timeout dengan AbortController
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000) // 15s timeout
  fetchOptions.signal = controller.signal

  try {
    const apiRes = await fetch(apiUrl, fetchOptions)
    clearTimeout(timeout)

    // STREAM RESPONSE (SSE)
    if (path.includes("/api/stream-log")) {
      return new NextResponse(apiRes.body, {
        status: apiRes.status,
        statusText: apiRes.statusText,
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
          "Content-Encoding": "none",
        },
      })
    }

    // TEXT RESPONSE
    const contentType = apiRes.headers.get("content-type") || ""
    if (contentType.startsWith("text/")) {
      const text = await apiRes.text()
      return new Response(text, {
        status: apiRes.status,
        headers: { "Content-Type": contentType || "text/plain" },
      })
    }

    // JSON RESPONSE (dengan fallback jika gagal parse)
    let data
    try {
      data = await apiRes.json()
    } catch {
      const fallbackText = await apiRes.text()
      return NextResponse.json({ message: "Invalid JSON", fallback: fallbackText }, { status: apiRes.status })
    }

    return NextResponse.json(data, { status: apiRes.status })
  } catch (err: any) {
    clearTimeout(timeout)
    console.error("API Proxy Error:", err)
    return NextResponse.json({ message: "API Proxy Error", detail: String(err) }, { status: 502 })
  }
}

export { handler as GET, handler as POST, handler as PUT, handler as DELETE, handler as PATCH }
