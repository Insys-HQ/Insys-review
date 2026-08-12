const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const Anthropic = require("@anthropic-ai/sdk");

admin.initializeApp();

// Cloud Console에서 "환경 변수"로 ANTHROPIC_API_KEY 를 등록하면 여기서 읽습니다.
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

const ANALYSIS_PROMPT = `당신은 기업 화재복구 TF를 지원하는 법무 검토 보조자입니다.
첨부된 변호사 의견서를 검토하여 아래 형식으로 한국어로 정리해주세요. 실제 법률 자문을 대체하지 않으며, TF 내부 참고용 요약임을 전제로 작성합니다.

1. 핵심 쟁점 (2~4개, 각 1~2문장)
2. 변호사의 권고 조치사항 (실행 가능한 항목 위주)
3. TF가 놓치면 안 되는 기한/데드라인 (있는 경우만)
4. 리스크 및 유의사항
5. 관련 트랙(화재보상/지자체지원/고객사보상/공장신축 중 해당하는 것)

각 항목은 간결하게, 불필요한 서론 없이 작성하세요.`;

// 웹 콘솔에서 바로 배포 가능한 HTTP 트리거 함수 (CORS 허용)
exports.analyzeLegalDoc = onRequest(
  { region: "asia-northeast3", timeoutSeconds: 120, memory: "512MiB", cors: true },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).json({ error: "POST만 허용됩니다." });
      return;
    }
    try {
      if (!ANTHROPIC_API_KEY) {
        res.status(500).json({ error: "ANTHROPIC_API_KEY 환경변수가 설정되지 않았습니다." });
        return;
      }
      const docId = req.body && req.body.docId;
      if (!docId) {
        res.status(400).json({ error: "docId가 필요합니다." });
        return;
      }

      const db = admin.firestore();
      const bucket = admin.storage().bucket();

      const docSnap = await db.collection("legalOpinions").doc(docId).get();
      if (!docSnap.exists) {
        res.status(404).json({ error: "문서를 찾을 수 없습니다." });
        return;
      }
      const docData = docSnap.data();

      const [fileBuffer] = await bucket.file(docData.storagePath).download();
      const base64Data = fileBuffer.toString("base64");

      const filename = docData.filename || "";
      const isPdf = filename.toLowerCase().endsWith(".pdf");

      if (!isPdf) {
        res.json({ analysis: "현재 자동분석은 PDF 파일만 지원합니다. doc/docx 파일은 PDF로 변환 후 다시 업로드해주세요." });
        return;
      }

      const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

      const message = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 1500,
        messages: [
          {
            role: "user",
            content: [
              { type: "document", source: { type: "base64", media_type: "application/pdf", data: base64Data } },
              { type: "text", text: ANALYSIS_PROMPT }
            ]
          }
        ]
      });

      const analysisText = message.content
        .filter((b) => b.type === "text")
        .map((b) => b.text)
        .join("\n");

      res.json({ analysis: analysisText });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: e.message || "서버 오류" });
    }
  }
);

