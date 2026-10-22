import { Request, Response } from "express";
import ProductAssistantService from "../services/ProductAssistantService";

type AssistantProduct = {
  uuid: string;
  name: string;
  price: number;
  stock: number;
  images?: string;
  categories?: string[];
};

type AssistantResponse = {
  message: string;
  products: AssistantProduct[];
};

const ollamaBaseUrl = process.env.OLLAMA_BASE_URL ?? "http://127.0.0.1:11434";

const model = process.env.OLLAMA_MODEL ?? "qwen3:4b";

type ToolCall = {
  function: {
    name: string;
    arguments: Record<string, unknown>;
  };
};

type OllamaMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  tool_calls?: ToolCall[];
};

type OllamaChatResponse = {
  message: OllamaMessage;
};

const tools = [
  {
    type: "function",
    function: {
      name: "searchProducts",
      description:
        "ค้นหาสินค้าที่กำลังขาย ใช้เมื่อผู้ใช้ถามหาสินค้า ราคา หรือหมวดหมู่",
      parameters: {
        type: "object",
        properties: {
          search: {
            type: "string",
            description: "คำค้นหา เช่น เครื่องพิมพ์ 3D หรือ mouse",
          },
          minPrice: {
            type: "number",
            description: "ราคาต่ำสุด",
          },
          maxPrice: {
            type: "number",
            description: "ราคาสูงสุด",
          },
          categoryIds: {
            type: "array",
            items: { type: "string" },
            description: "UUID ของหมวดหมู่สินค้า",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getProductDetail",
      description: "ดูรายละเอียดสินค้าจาก UUID",
      parameters: {
        type: "object",
        required: ["productUuid"],
        properties: {
          productUuid: {
            type: "string",
            description: "UUID ของสินค้า",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "checkStock",
      description: "ตรวจสอบ stock ล่าสุดของสินค้าจาก UUID",
      parameters: {
        type: "object",
        required: ["productUuid"],
        properties: {
          productUuid: {
            type: "string",
            description: "UUID ของสินค้า",
          },
        },
      },
    },
  },
];

async function executeTool(name: string, args: Record<string, unknown>) {
  switch (name) {
    case "searchProducts":
      return ProductAssistantService.searchProducts({
        search: typeof args.search === "string" ? args.search : undefined,
        minPrice: typeof args.minPrice === "number" ? args.minPrice : undefined,
        maxPrice: typeof args.maxPrice === "number" ? args.maxPrice : undefined,
        categoryIds: Array.isArray(args.categoryIds)
          ? args.categoryIds.filter(
              (categoryId): categoryId is string =>
                typeof categoryId === "string",
            )
          : [],
        limit: 5,
      });

    case "getProductDetail":
      return ProductAssistantService.getProductDetail(String(args.productUuid));

    case "checkStock":
      return ProductAssistantService.checkStock(String(args.productUuid));

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

export default class ClientAssistantController {
  static async chat(req: Request, res: Response) {
    try {
      const foundProducts: AssistantProduct[] = [];
      const userMessage = String(req.body.message ?? "").trim();

      if (!userMessage) {
        return res.status(400).json({
          message: "Message is required",
        });
      }

      const messages: OllamaMessage[] = [
        {
          role: "system",
          content: `
คุณคือ AI Product Assistant ของร้านค้าออนไลน์
ตอบลูกค้าเป็นภาษาไทย สุภาพ กระชับ

กฎสำคัญ:
- ห้ามแต่งข้อมูลสินค้า ราคา หรือ stock เอง
- ถ้าลูกค้าถามหาสินค้า ราคา หรือจำนวนคงเหลือ ให้เรียก tools ก่อนเสมอ
- ถ้าไม่พบสินค้า ให้ตอบตรง ๆ ว่าไม่พบสินค้า
- แนะนำเฉพาะสินค้าที่ได้จาก tool เท่านั้น
          `.trim(),
        },
        {
          role: "user",
          content: userMessage,
        },
      ];

      for (let round = 0; round < 3; round++) {
        const response = await fetch(`${ollamaBaseUrl}/api/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            messages,
            tools,
            stream: false,
          }),
        });

        if (!response.ok) {
          throw new Error(
            `Ollama error ${response.status}: ${await response.text()}`,
          );
        }

        const result = (await response.json()) as OllamaChatResponse;
        const assistantMessage = result.message;

        messages.push(assistantMessage);

        const toolCalls = assistantMessage.tool_calls ?? [];

        // ไม่มี tool call แล้ว = ได้คำตอบสุดท้าย
        // if (toolCalls.length === 0) {
        //   return res.status(200).json({
        //     message: assistantMessage.content,
        //   });
        // }
        if (toolCalls.length === 0) {
          return res.status(200).json({
            message: assistantMessage.content,
            products: foundProducts,
          } satisfies AssistantResponse);
        }

        // มี tool call = ให้ backend ไปอ่านข้อมูลจริงจาก MySQL
        for (const toolCall of toolCalls) {
          const { name, arguments: args } = toolCall.function;

          console.log(`🤖 AI called tool: ${name}`, args);

          const toolResult = await executeTool(name, args);

          if (name === "searchProducts" && Array.isArray(toolResult)) {
            foundProducts.splice(
              0,
              foundProducts.length,
              ...toolResult.map((product) => ({
                uuid: product.uuid,
                name: product.name,
                price: Number(product.price),
                stock: Number(product.stock),
                images: product.images?.[0]
                  ? product.images[0].path +"/"+ product.images[0].image
                  : undefined,
                categories: product.categories?.map((c) => c.name) ?? [],
              })),
            );
          }
          messages.push({
            role: "tool",
            content: JSON.stringify(toolResult),
          });
        }
      }

      return res.status(500).json({
        message: "AI called too many tools",
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);

      console.error("❌ AI Assistant failed:", message);

      return res.status(500).json({
        message: "AI Assistant is unavailable",
      });
    }
  }
}
