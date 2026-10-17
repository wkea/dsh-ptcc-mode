/**
 * Interaction 工具:AI 编写一段 JavaScript,在聊天流中渲染一个用户可交互的组件
 * (单选、复选、按钮、日志区等任意 DOM),用于向用户收集需求。
 *
 * 执行模型:本工具不等待用户操作 —— 调用后立即返回,组件留在聊天里;
 * 用户提交后,答案作为下一条用户消息送达 AI。因此工具描述里明确要求
 * AI 在调用本工具后结束本轮、等待用户操作。
 */

/** 单段代码的最大长度(字节)。 */
const MAX_CODE_BYTES = 65536;

const PARAMETERS = {
	type: "object",
	properties: {
		code: {
			type: "string",
			description: "在沙盒页面中运行的 JavaScript 代码。页面只含一个 <div id=\"app\">,代码在其内部自由创建 DOM。可用 window.dsh.answer(value) 提交结果、window.dsh.log(message) 追加日志;console.log/warn/error 也会转发到日志区。沙盒无网络、无存储、无父页面访问。"
		},
		title: {
			type: "string",
			description: "组件的短标题,显示在组件顶部,便于用户理解交互目的。"
		}
	},
	required: ["code"]
};

const DESCRIPTION = [
	"在聊天中渲染一个由你编写的交互式组件,向用户收集需求。参数 code 是一段 JavaScript,运行在沙盒页面里仅含 <div id=\"app\"> 的容器上,可自由创建任意 DOM(单选、复选、按钮、日志区等)。",
	"沙盒约定:",
	"- window.dsh.answer(value):提交最终结果。value 会被 JSON 序列化,作为下一条用户消息发回;提交后组件关闭。",
	"- window.dsh.log(message):向组件下方日志区追加一行文本;console.log/warn/error 同样转发到日志区。",
	"- 沙盒无网络、无浏览器存储、无法访问父页面;document.getElementById('app') 是唯一挂载点。",
	"- 页面已内置 Tailwind CSS(v3,运行时 JIT):直接给元素写 Tailwind 类即可,任意工具类与任意值(如 bg-[#141414])都可用,无需引入样式表。",
	"样式要求:必须使用 Tailwind CSS 设计深色、极简、优雅的组件 —— 深色背景、柔和边框、克制配色、清晰层次、合适留白、精致圆角与过渡;绝不能露出浏览器原生控件外观:所有按钮、输入框、文本域、下拉框、单选/复选一律用 Tailwind 类整体重塑(appearance-none、自定义背景、边框与焦点态),细节如占位符与滚动条也要处理。dark: 变体跟随应用主题(暗色时 <html> 带 dark 类)。可补充 <style> 块,但首选 Tailwind 类。",
	"布局要求:组件只占自身内容所需高度,绝不撑满视口 —— 不要用 min-h-screen、h-screen、h-[100vh] 之类整屏类,也不要给 html、body 写背景或高度样式;深色背景只放在卡片自身容器上(如 bg-[#141414] 包一层),卡片高度随内容自适应,卡片之外的空白保持透明、与上层聊天界面融为一体。",
	"调用本工具后请立即结束本轮回复,等待用户操作;不要继续工作。用户提交后,你会收到一条以 [Interaction answer · <callId>] 开头、后接 JSON 值的用户消息。"
].join("\n");

export const inject = ["tools"];

export function apply(ctx) {
	ctx.tools.register({
		name: "Interaction",
		description: DESCRIPTION,
		parameters: PARAMETERS,
		output: {
			schema: {
				type: "object",
				properties: {
					accepted: { type: "boolean" },
					message: { type: "string" }
				},
				required: ["accepted", "message"]
			},
			render(_args, value) {
				return [{ type: "text", text: JSON.stringify(value) }];
			}
		},
		async execute(args) {
			const code = typeof args.code === "string" ? args.code : "";
			if (code.trim() === "") {
				throw new Error("Interaction: code 不能为空");
			}
			if (Buffer.byteLength(code, "utf8") > MAX_CODE_BYTES) {
				throw new Error(`Interaction: code 过长(上限 ${MAX_CODE_BYTES} 字节)`);
			}
			return {
				accepted: true,
				message: "组件已渲染到聊天流。请结束本轮回复并等待用户操作;用户提交的答案会作为下一条用户消息到达,以 [Interaction answer · <callId>] 开头。"
			};
		}
	});
}
