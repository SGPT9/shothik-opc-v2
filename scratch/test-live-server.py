import urllib.request
import json

def test_live_server():
    print("=== Testing Live Hermes Next.js Dev Server (http://localhost:3001) ===")
    
    # 1. Create Session
    session_payload = {
        "workspaceId": "ws_live_test",
        "title": "Live Dev Server Session",
        "description": "Testing live Hermes API gateway"
    }
    req1 = urllib.request.Request(
        "http://localhost:3001/api/hermes/sessions",
        data=json.dumps(session_payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    res1 = json.loads(urllib.request.urlopen(req1).read().decode("utf-8"))
    session_id = res1["session"]["id"]
    print(f"[PASS] 1. Create Session OK: {session_id}")

    # 2. Get Session
    req2 = urllib.request.Request(f"http://localhost:3001/api/hermes/sessions/{session_id}")
    res2 = json.loads(urllib.request.urlopen(req2).read().decode("utf-8"))
    print(f"[PASS] 2. Get Session OK: {res2['session']['title']}")

    # 3. Create Run
    run_payload = {
        "sessionId": session_id,
        "workspaceId": "ws_live_test",
        "domain": "general"
    }
    req3 = urllib.request.Request(
        "http://localhost:3001/api/hermes/runs",
        data=json.dumps(run_payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    res3 = json.loads(urllib.request.urlopen(req3).read().decode("utf-8"))
    run_id = res3["run"]["id"]
    stream_url = res3["streamUrl"]
    print(f"[PASS] 3. Create Run OK: {run_id} -> {stream_url}")

    # 4. GET SSE Stream
    req4 = urllib.request.Request(stream_url)
    sse_output = urllib.request.urlopen(req4).read().decode("utf-8")
    print(f"[PASS] 4. SSE Stream Output Received:\n{sse_output.strip()}")

    print("\n=== ALL LIVE DEV SERVER TESTS PASSED ===")

if __name__ == "__main__":
    test_live_server()
