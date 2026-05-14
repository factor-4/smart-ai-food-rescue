"""
Official MCP client test — connects via SSE and calls tools.
"""
import asyncio
from mcp.client.sse import sse_client
from mcp.client.session import ClientSession

async def main():
    async with sse_client(url="http://localhost:8001/sse") as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            tools = await session.list_tools()
            print("Tools:", [t.name for t in tools.tools])

            # Call get_user_history
            result = await session.call_tool("get_user_history", arguments={"user_id": 1})
            print("User history:", result.content[0].text)

            # Call record_click
            result2 = await session.call_tool("record_click", arguments={"user_id": 42, "bag_id": 148})
            print("Record click:", result2.content[0].text)

asyncio.run(main())