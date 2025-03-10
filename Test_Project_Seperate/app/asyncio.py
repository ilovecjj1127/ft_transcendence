import asyncio

async def fn():
	print('This is ')
	await asyncio.sleep(1)

asyncio.run(fn())

