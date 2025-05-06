# # # from .my_zerox_wrapper import Zerox
# # # import asyncio

# # # async def extract_text_from_pdf(file_path: str) -> str:
# # #     z = Zerox()
# # #     result = await z.read_pdf(file_path)
# # #     if result and result.pages:
# # #         return "\n\n".join([p.content for p in result.pages])
# # from .my_zerox_wrapper import Zerox
# # import asyncio

# # async def extract_text_from_pdf(file_path: str) -> str:
# #     z = Zerox()
# #     result = await z.read_pdf(file_path)

# #     # 🔍 Inspect the result structure
# #     print("🧾 Zerox raw result:", result)

# #     # ✅ Attempt to access 'text' key safely
# #     if result and isinstance(result, dict):
# #         return result.get("text", "No text found.")
    
# #     return "No text found."
# # #     return "No text found."


# # from .my_zerox_wrapper import Zerox

# # async def extract_text_from_pdf(file_path: str) -> str:
# #     z = Zerox()
# #     result = await z.read_pdf(file_path)

# #     try:
# #         if isinstance(result, dict) and "pages" in result:
# #             return "\n\n".join([p["content"] for p in result["pages"] if "content" in p])
# #         elif hasattr(result, "pages"):
# #             return "\n\n".join([p.content for p in result.pages])
# #         else:
# #             return "No text found."
# #     except Exception as e:
# #         return f"❌ Error parsing result: {e}"


# from .my_zerox_wrapper import Zerox
# import asyncio

# async def extract_text_from_pdf(file_path: str) -> str:
#     z = Zerox()
#     result = await z.read_pdf(file_path)

#     print(f"🧪 Raw Zerox result: {result}")  # 👈 Log raw result

#     # Try accessing structured fields, if available
#     if isinstance(result, dict) and "pages" in result:
#         return "\n\n".join([p["content"] for p in result["pages"] if "content" in p])
#     elif hasattr(result, "pages"):
#         return "\n\n".join([p.content for p in result.pages])
    
#     return "No text found."


from .my_zerox_wrapper import Zerox
import asyncio

async def extract_text_from_pdf(file_path: str) -> str:
    z = Zerox()
    result = await z.read_pdf(file_path)

    print("Type of result:", type(result))
    print("Raw Zerox result:", result)

    # If result is a dict with "pages"
    if isinstance(result, dict) and "pages" in result:
        return "\n\n".join([p["content"] for p in result["pages"] if "content" in p])
    
    # If result is a custom object with pages list
    elif hasattr(result, "pages"):
        return "\n\n".join([p.content for p in result.pages])
    
    return "No text found."
