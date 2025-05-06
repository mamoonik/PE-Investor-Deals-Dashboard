
# # # # ✅ Correct
# # # from py_zerox.pyzerox.core.zerox import zerox
# # # import os
# # # from dotenv import load_dotenv
# # # from pathlib import Path  # ✅ ADD THIS LINE

# # # # Explicitly resolve .env path
# # # env_path = Path(__file__).resolve().parents[3] / ".env"
# # # print(f"🔍 Trying to load .env from: {env_path}")  # debug line

# # # # Load and confirm
# # # load_dotenv(dotenv_path=env_path)
# # # print(f"🔑 Loaded API key: {os.getenv('OPENAI_API_KEY')}")

# # # class Zerox:
# # #     def __init__(self, model="gpt-4o"):
# # #         self.model = model
# # #         os.environ["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY")

# # #     async def read_pdf(self, file_path):
# # #         return await zerox(
# # #             file_path=file_path,
# # #             model=self.model,
# # #             maintain_format=True
# # #         )


# # from py_zerox.pyzerox.core.zerox import zerox
# # import os

# # # ❗ Directly set your key here (temporary workaround)
# # os.environ["OPENAI_API_KEY"] = "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"

# # class Zerox:
# #     def __init__(self, model="gpt-4o-mini"):
# #         self.model = model

# #     async def read_pdf(self, file_path):
# #         try:
# #             print(f"📥 Starting zerox on: {file_path} with model {self.model}")

# #             result = await zerox(
# #                 file_path=file_path,
# #                 model=self.model,
# #                 maintain_format=True
# #             )
# #             print(f"📤 Finished zerox. Result: {result}")

# #             print(f"✅ Zerox returned: {result}")
# #             return result
# #         except Exception as e:
# #             print(f"❌ Zerox failed: {e}")
# #             return {"error": str(e)}


# from py_zerox.pyzerox.core.zerox import zerox
# import os

# # ❗ Set your OpenAI API key directly (temporary workaround)
# os.environ["OPENAI_API_KEY"] = "sk-..."  # Your real key

# class Zerox:
#     def __init__(self, model="gpt-4-vision-preview"):  # ✅ Use gpt-4o or gpt-4-vision-preview
#         self.model = model

#     async def read_pdf(self, file_path):
#         try:
#             print(f"📥 Starting zerox on: {file_path} with model {self.model}")
#             result = await zerox(
#                 file_path=file_path,
#                 model=self.model,
#                 maintain_format=True
#             )
#             print(f"📤 Finished zerox. Result: {result}")
#             return result
#         except Exception as e:
#             print(f"❌ Zerox failed: {e}")
#             return {"error": str(e)}


from py_zerox.pyzerox.core.zerox import zerox
import os

# ❗ Directly set your key here (temporary workaround)
os.environ["OPENAI_API_KEY"] = "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"

class Zerox:
    def __init__(self, model="gpt-4o"):  # ✅ gpt-4o works for OCR
        self.model = model


    async def read_pdf(self, file_path):
        try:
            print(f"📥 Starting zerox on: {file_path} with model {self.model}")
            result = await zerox(
                file_path=file_path,
                model=self.model,
                maintain_format=True
            )
            print(f"Finished zerox. Result: {result}")
            return result
        except Exception as e:
            print(f"Zerox failed: {e}")
            return {"error": str(e)}
