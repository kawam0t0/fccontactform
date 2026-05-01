"use client"

import { useState } from "react"

const PREFECTURES = [
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
  "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
  "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
  "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県",
]

const BRAND = "#004d9c"
const BRAND_LIGHT = "#e8eef8"

// 「資料を詳しく見て検討したい」は常に選択済みで外せない
const FIXED_STEP = "資料を詳しく見て検討したい"

const STEP_OPTIONS = [
  FIXED_STEP,
  "オンライン（Zoom等）での説明を希望",
  "対面での面談・店舗見学を希望",
  "具体的土地のシミュレーション相談",
]

type ContactType = "法人" | "個人" | ""
type LandStatus = "所有している" | "候補地あり" | "これから探したい" | ""
type SplashExperience = "ある" | "ない" | ""
type PageState = "form" | "confirm" | "complete"

export default function FranchiseForm() {
  const [pageState, setPageState] = useState<PageState>("form")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")

  const [contactType, setContactType] = useState<ContactType>("")
  const [companyName, setCompanyName] = useState("")
  const [name, setName] = useState("")
  const [department, setDepartment] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [splashExperience, setSplashExperience] = useState<SplashExperience>("")
  const [area, setArea] = useState("")
  const [landStatus, setLandStatus] = useState<LandStatus>("")
  const [tsubo, setTsubo] = useState("")
  // 「資料を詳しく見て検討したい」は初期選択 & 外せない
  const [steps, setSteps] = useState<string[]>([FIXED_STEP])
  const [message, setMessage] = useState("")
  const [agreed, setAgreed] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const toggleStep = (step: string) => {
    if (step === FIXED_STEP) return // 外せない
    setSteps((prev) =>
      prev.includes(step) ? prev.filter((s) => s !== step) : [...prev, step]
    )
  }

  const isCorporate = contactType === "法人"
  const needsTsubo = landStatus === "所有している" || landStatus === "候補地あり"

  const validate = () => {
    const e: Record<string, string> = {}
    if (!contactType) e.contactType = "お問い合わせ種別を選択してください"
    if (isCorporate && !companyName.trim()) e.companyName = "貴社名を入力してください"
    if (!name.trim()) e.name = "お名前を入力してください"
    if (isCorporate && !department.trim()) e.department = "部署名・役職名を入力してください"
    if (!email.trim()) e.email = "メールアドレスを入力してください"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "正しいメールアドレスを入力してください"
    if (!phone.trim()) e.phone = "電話番号を入力してください"
    if (!splashExperience) e.splashExperience = "ご利用経験を選択してください"
    if (!area) e.area = "出店希望エリアを選択してください"
    if (!landStatus) e.landStatus = "土地の所有状況を選択してください"
    if (needsTsubo && !tsubo.trim()) e.tsubo = "坪数を入力してください"
    if (!agreed) e.agreed = "同意事項にチェックしてください"
    return e
  }

  // フォームの「内容を確認する」ボタン
  const handleGoConfirm = (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      const firstKey = Object.keys(errs)[0]
      const el = document.getElementById(firstKey)
      el?.scrollIntoView({ behavior: "smooth", block: "center" })
      return
    }
    setErrors({})
    setPageState("confirm")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // 確認画面の「送信する」ボタン
  const handleSubmit = async () => {
    setIsSubmitting(true)
    setSubmitError("")
    try {
      const payload = {
        type: contactType,
        companyName,
        name,
        department,
        email,
        phone,
        experience: splashExperience,
        area,
        landStatus,
        tsubo,
        steps: steps.join("、"),
        message,
      }
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? "送信に失敗しました")
      }
      setPageState("complete")
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "送信中にエラーが発生しました")
    } finally {
      setIsSubmitting(false)
    }
  }

  // ─── 完了画面 ───
  if (pageState === "complete") {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <PageHeader />
        <div className="flex-1 flex items-center justify-center px-4 py-20">
          <div className="max-w-lg w-full text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-8"
              style={{ background: BRAND }}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p className="text-[10px] tracking-[0.3em] uppercase mb-3 font-bold" style={{ color: BRAND }}>
              Thank you
            </p>
            <h2 className="text-2xl font-bold mb-5 text-[#111827]">
              お問い合わせを受け付けました
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              ご入力いただきありがとうございます。<br />
              担当者よりご連絡いたしますので、しばらくお待ちください。<br /><br />
              自動返信メールをお送りしていますのでご確認ください。
            </p>
          </div>
        </div>
        <PageFooter />
      </div>
    )
  }

  // ─── 確認画面 ───
  if (pageState === "confirm") {
    const rows: { label: string; value: string; show?: boolean }[] = [
      { label: "お問い合わせ種別", value: contactType },
      { label: "貴社名", value: companyName, show: isCorporate },
      { label: "お名前", value: name },
      { label: "部署名・役職名", value: department, show: isCorporate },
      { label: "メールアドレス", value: email },
      { label: "電話番号", value: phone },
      { label: "スプラッシュンゴーのご利用経験", value: splashExperience },
      { label: "出店希望エリア", value: area },
      {
        label: "土地の所有状況",
        value: needsTsubo ? `${landStatus}（${tsubo}坪）` : landStatus,
      },
      { label: "ご希望の検討ステップ", value: steps.join("、") },
      { label: "ご質問・ご要望", value: message || "—" },
    ]

    return (
      <div className="min-h-screen bg-[#f5f7fb] flex flex-col">
        <PageHeader />

        {/* Hero */}
        <div style={{ background: BRAND }}>
          <div className="max-w-5xl mx-auto px-6 pt-14 pb-20">
            <p className="text-[10px] tracking-[0.4em] uppercase text-white/40 mb-5">Confirmation</p>
            <h1 className="text-2xl md:text-3xl font-black text-white leading-tight">
              入力内容のご確認
            </h1>
            <div className="mt-5 w-10 h-0.5 bg-white/30" />
            <p className="mt-4 text-sm text-white/60 leading-relaxed">
              以下の内容でよろしければ「送信する」を押してください。
            </p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 md:px-6 -mt-6 pb-24 w-full">
          <div className="bg-white rounded-2xl shadow-xl shadow-blue-900/10 border border-gray-100 overflow-hidden">

            <div className="px-6 md:px-10 py-8 flex flex-col divide-y divide-gray-100">
              {rows
                .filter((r) => r.show !== false)
                .map((r) => (
                  <div key={r.label} className="flex flex-col sm:flex-row sm:gap-6 py-4 first:pt-0 last:pb-0">
                    <dt className="text-[11px] font-bold tracking-widest uppercase text-gray-400 sm:w-48 shrink-0 mb-1 sm:mb-0 sm:pt-0.5">
                      {r.label}
                    </dt>
                    <dd className="text-sm text-[#111827] font-medium leading-relaxed whitespace-pre-wrap break-words">
                      {r.value}
                    </dd>
                  </div>
                ))}
            </div>

            <div className="px-6 md:px-10 pb-8 flex flex-col gap-3">
              {submitError && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {submitError}
                </div>
              )}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full py-4 text-sm font-bold tracking-[0.2em] uppercase text-white rounded-xl transition-all duration-200 active:scale-[0.99] focus:outline-none flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: "#004d9c",
                  boxShadow: "0 8px 24px rgba(0,77,156,0.28)",
                }}
                onMouseEnter={(e) => { if (!isSubmitting) e.currentTarget.style.background = "#0059b8" }}
                onMouseLeave={(e) => { if (!isSubmitting) e.currentTarget.style.background = "#004d9c" }}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    送信中...
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                    送信する
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => { setPageState("form"); window.scrollTo({ top: 0, behavior: "smooth" }) }}
                className="w-full py-3 text-sm font-semibold text-gray-500 border border-gray-200 rounded-xl hover:border-gray-300 hover:text-gray-700 transition-all"
              >
                入力内容を修正する
              </button>
            </div>
          </div>
        </div>

        <PageFooter />
      </div>
    )
  }

  // ─── 入力フォーム画面 ───
  return (
    <div className="min-h-screen bg-[#f5f7fb] flex flex-col">
      <PageHeader />

      {/* Hero */}
      <div style={{ background: BRAND }}>
        <div className="max-w-5xl mx-auto px-6 pt-14 pb-20">
          <p className="text-[10px] tracking-[0.4em] uppercase text-white/40 mb-5">Franchise Contact Form</p>
          <h1 className="text-3xl md:text-4xl font-black text-white leading-tight text-balance">
            フランチャイズ加盟<br />お問い合わせ
          </h1>
          <div className="mt-6 w-10 h-0.5 bg-white/30" />
          <p className="mt-5 text-sm text-white/60 leading-relaxed max-w-md">
          </p>
        </div>
      </div>

      {/* Form body */}
      <div className="max-w-3xl mx-auto px-4 md:px-6 -mt-6 pb-24 w-full">
        <div className="bg-white rounded-2xl shadow-xl shadow-blue-900/10 border border-gray-100 overflow-hidden">

          <form onSubmit={handleGoConfirm} noValidate>

            {/* ─── SECTION 1: 基本情報 ─── */}
            <SectionHeader index={1} title="基本情報" />
            <div className="px-6 md:px-10 py-8 flex flex-col gap-8">

              {/* お問い合わせ種別 */}
              <Field id="contactType" label="お問い合わせ種別" required error={errors.contactType}>
                <div className="flex gap-3 flex-wrap mt-1">
                  {(["法人", "個人"] as ContactType[]).map((type) => (
                    <PillRadio
                      key={type}
                      label={type}
                      checked={contactType === type}
                      onChange={() => {
                        setContactType(type)
                        setErrors((e) => ({ ...e, contactType: "" }))
                      }}
                    />
                  ))}
                </div>
                <div className="mt-4 flex gap-2.5 rounded-lg bg-amber-50 border border-amber-100 px-4 py-3">
                  <svg className="shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    本事業は投資規模および運営体制の観点から、法人様による事業展開、または法人設立を前提としたご検討を推奨しております。
                  </p>
                </div>
              </Field>

              {/* 貴社名 */}
              <Field
                id="companyName"
                label="貴社名"
                required={isCorporate}
                note={!isCorporate ? "法人の場合のみ必須" : undefined}
                error={errors.companyName}
              >
                <LineInput
                  id="companyName"
                  value={companyName}
                  onChange={(v) => { setCompanyName(v); setErrors((e) => ({ ...e, companyName: "" })) }}
                  placeholder="株式会社〇〇"
                  disabled={!isCorporate}
                />
              </Field>

              {/* お名前 */}
              <Field id="name" label="お名前" required error={errors.name}>
                <LineInput
                  id="name"
                  value={name}
                  onChange={(v) => { setName(v); setErrors((e) => ({ ...e, name: "" })) }}
                  placeholder="山田 太郎"
                />
              </Field>

              {/* 部署名・役職名 */}
              <Field
                id="department"
                label="部署名・役職名"
                required={isCorporate}
                note={!isCorporate ? "法人の場合のみ必須" : undefined}
                error={errors.department}
              >
                <LineInput
                  id="department"
                  value={department}
                  onChange={(v) => { setDepartment(v); setErrors((e) => ({ ...e, department: "" })) }}
                  placeholder="営業部 部長"
                  disabled={!isCorporate}
                />
              </Field>

              {/* メールアドレス */}
              <Field id="email" label="メールアドレス" required error={errors.email}>
                <LineInput
                  id="email"
                  type="email"
                  value={email}
                  onChange={(v) => { setEmail(v); setErrors((e) => ({ ...e, email: "" })) }}
                  placeholder="example@company.co.jp"
                />
              </Field>

              {/* 電話番号 */}
              <Field id="phone" label="電話番号" required error={errors.phone}>
                <LineInput
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(v) => { setPhone(v); setErrors((e) => ({ ...e, phone: "" })) }}
                  placeholder="090-0000-0000"
                />
              </Field>

            </div>

            <Divider />

            {/* ─── SECTION 2: 出店検討情報 ─── */}
            <SectionHeader index={2} title="出店検討情報" />
            <div className="px-6 md:px-10 py-8 flex flex-col gap-8">

              {/* スプラッシュンゴー利用経験 */}
              <Field id="splashExperience" label="スプラッシュンゴーのご利用経験" required error={errors.splashExperience}>
                <div className="flex gap-3 flex-wrap mt-1">
                  {(["ある", "ない"] as SplashExperience[]).map((opt) => (
                    <PillRadio
                      key={opt}
                      label={opt}
                      checked={splashExperience === opt}
                      onChange={() => {
                        setSplashExperience(opt)
                        setErrors((e) => ({ ...e, splashExperience: "" }))
                      }}
                    />
                  ))}
                </div>
              </Field>

              {/* 出店希望エリア */}
              <Field id="area" label="出店希望エリア（都道府県）" required error={errors.area}>
                <div className="relative mt-1">
                  <select
                    id="area"
                    value={area}
                    onChange={(e) => { setArea(e.target.value); setErrors((er) => ({ ...er, area: "" })) }}
                    className="w-full appearance-none bg-transparent border-0 border-b-2 pb-2 pt-1 text-sm text-[#111827] focus:outline-none transition-colors pr-8"
                    style={{ borderBottomColor: area ? BRAND : "#e5e7eb" }}
                  >
                    <option value="">都道府県を選択してください</option>
                    {PREFECTURES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </span>
                </div>
              </Field>

              {/* 土地の所有状況 */}
              <Field id="landStatus" label="土地の所有状況" required error={errors.landStatus}>
                <div className="flex flex-col gap-2.5 mt-1">
                  {([
                    { value: "所有している", label: "土地を所有している（以下に坪数を記入してください）" },
                    { value: "候補地あり", label: "候補地がある（以下に坪数を記入してください）" },
                    { value: "これから探したい", label: "これから土地を探したい" },
                  ] as { value: LandStatus; label: string }[]).map((opt) => (
                    <PillRadio
                      key={opt.value}
                      label={opt.label}
                      checked={landStatus === opt.value}
                      onChange={() => {
                        setLandStatus(opt.value)
                        setTsubo("")
                        setErrors((e) => ({ ...e, landStatus: "", tsubo: "" }))
                      }}
                      block
                    />
                  ))}
                </div>

                {needsTsubo && (
                  <div
                    className="mt-4 flex items-center gap-4 px-5 py-4 rounded-xl border"
                    style={{ borderColor: BRAND_LIGHT, background: BRAND_LIGHT }}
                  >
                    <label htmlFor="tsubo" className="text-sm font-semibold text-[#111827] shrink-0 whitespace-nowrap">
                      坪数
                      <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded text-white" style={{ background: BRAND }}>必須</span>
                    </label>
                    {/* 半角数字のみ受け付け */}
                    <input
                      id="tsubo"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={tsubo}
                      onChange={(e) => {
                        const v = e.target.value.replace(/[^0-9]/g, "")
                        setTsubo(v)
                        setErrors((er) => ({ ...er, tsubo: "" }))
                      }}
                      className="w-24 bg-transparent border-0 border-b-2 pb-1 text-sm text-[#111827] focus:outline-none transition-colors"
                      style={{ borderBottomColor: tsubo ? BRAND : "#c0cce0" }}
                      placeholder="例：500"
                    />
                    <span className="text-sm text-gray-500">坪</span>
                  </div>
                )}
                {errors.tsubo && <ErrorMsg>{errors.tsubo}</ErrorMsg>}
              </Field>

            </div>

            <Divider />

            {/* ─── SECTION 3: ご希望・ご意見 ─── */}
            <SectionHeader index={3} title="ご希望・ご意見" />
            <div className="px-6 md:px-10 py-8 flex flex-col gap-8">

              {/* ご希望の検討ステップ */}
              <Field id="steps" label="ご希望の検討ステップ" required error={errors.steps}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-1">
                  {STEP_OPTIONS.map((opt) => {
                    const isFixed = opt === FIXED_STEP
                    return (
                      <CheckTile
                        key={opt}
                        label={opt}
                        checked={steps.includes(opt)}
                        onChange={() => {
                          toggleStep(opt)
                          setErrors((e) => ({ ...e, steps: "" }))
                        }}
                        locked={isFixed}
                      />
                    )
                  })}
                </div>
              </Field>

              {/* ご質問・ご要望 */}
              <Field id="message" label="ご質問・ご要望">
                <textarea
                  id="message"
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="自由にご記入ください"
                  className="w-full mt-1 bg-[#f9fafb] border-0 border-b-2 border-gray-200 rounded-t-md px-4 py-3 text-sm text-[#111827] placeholder:text-gray-300 focus:outline-none focus:border-b-[#004d9c] transition-colors resize-none leading-relaxed"
                />
              </Field>

            </div>

            <Divider />

            {/* ─── SECTION 4: 同意事項 & 送信 ─── */}
            <div className="px-6 md:px-10 py-8 flex flex-col gap-6">

              {/* 同意事項 */}
              <div id="agreed">
                <label className="flex items-start gap-3.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={() => { setAgreed(!agreed); setErrors((e) => ({ ...e, agreed: "" })) }}
                    className="sr-only"
                  />
                  <span
                    className="mt-0.5 w-5 h-5 rounded flex items-center justify-center shrink-0 border-2 transition-all"
                    style={{
                      borderColor: agreed ? BRAND : "#d1d5db",
                      background: agreed ? BRAND : "white",
                    }}
                  >
                    {agreed && (
                      <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="2 6 5 9 10 3" />
                      </svg>
                    )}
                  </span>
                  <span className="text-sm leading-relaxed text-gray-600 group-hover:text-gray-800 transition-colors">
                    私は競合他社ではありません。また、資料に含まれる独自の収支データ等の内容を第三者に開示しないことに同意します。
                  </span>
                </label>
                {errors.agreed && <ErrorMsg>{errors.agreed}</ErrorMsg>}
              </div>

              {/* 確認へ進むボタン */}
              <button
                type="submit"
                className="w-full py-4 text-sm font-bold tracking-[0.2em] uppercase text-white rounded-xl transition-all duration-200 active:scale-[0.99] focus:outline-none flex items-center justify-center gap-3"
                style={{
                  background: "#004d9c",
                  boxShadow: "0 8px 24px rgba(0,77,156,0.28)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#0059b8")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#004d9c")}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
                入力内容を確認する
              </button>
              <p className="text-center text-xs text-gray-300 -mt-2">
                
              </p>
            </div>

          </form>
        </div>
      </div>

      <PageFooter />
    </div>
  )
}

/* ─── 共通レイアウト ─── */

function PageHeader() {
  return (
    <header className="bg-white border-b border-gray-100 shrink-0">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <span className="text-sm font-black tracking-widest" style={{ color: "#004d9c" }}>
          SPLASH&apos;N&apos;GO!
        </span>
        <span
          className="hidden sm:inline-block text-[10px] font-bold tracking-[0.2em] uppercase px-3 py-1.5 rounded-sm text-white"
          style={{ background: "#004d9c" }}
        >
          FC 加盟募集
        </span>
      </div>
    </header>
  )
}

function PageFooter() {
  return (
    <footer
      className="py-6 text-center text-xs text-white/60 shrink-0"
      style={{ background: "#004d9c" }}
    >
      &copy; SPLASH&apos;N&apos;GO! All Rights Reserved.
    </footer>
  )
}

/* ─── Sub-components ─── */

function SectionHeader({ index, title }: { index: number; title: string }) {
  return (
    <div className="flex items-center gap-4 px-6 md:px-10 pt-8 pb-2">
      <span
        className="inline-flex items-center justify-center w-7 h-7 rounded-full text-white text-xs font-black shrink-0"
        style={{ background: BRAND }}
      >
        {index}
      </span>
      <span className="text-xs font-bold tracking-[0.2em] uppercase text-gray-400">{title}</span>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  )
}

function Divider() {
  return <div className="h-px bg-gray-100 mx-0" />
}

function Field({
  id,
  label,
  required,
  note,
  error,
  children,
}: {
  id: string
  label: string
  required?: boolean
  note?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2 flex-wrap">
        <label htmlFor={id} className="text-[11px] font-bold tracking-widest uppercase text-gray-400">
          {label}
        </label>
        {required && (
          <span
            className="text-[9px] font-black tracking-wider px-1.5 py-0.5 rounded text-white uppercase"
            style={{ background: BRAND }}
          >
            必須
          </span>
        )}
        {note && (
          <span className="text-[11px] text-gray-300">※{note}</span>
        )}
      </div>
      {children}
      {error && <ErrorMsg>{error}</ErrorMsg>}
    </div>
  )
}

function LineInput({
  id,
  value,
  onChange,
  placeholder,
  type = "text",
  disabled,
}: {
  id: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  disabled?: boolean
}) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="mt-1 w-full bg-transparent border-0 border-b-2 pb-2 pt-1 text-sm text-[#111827] placeholder:text-gray-300 focus:outline-none transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      style={{ borderBottomColor: value && !disabled ? BRAND : "#e5e7eb" }}
      onFocus={(e) => { if (!disabled) e.currentTarget.style.borderBottomColor = BRAND }}
      onBlur={(e) => { e.currentTarget.style.borderBottomColor = value && !disabled ? BRAND : "#e5e7eb" }}
    />
  )
}

function PillRadio({
  label,
  checked,
  onChange,
  block,
}: {
  label: string
  checked: boolean
  onChange: () => void
  block?: boolean
}) {
  return (
    <label
      className={`inline-flex items-center gap-2 cursor-pointer rounded-full border transition-all duration-150 text-sm select-none px-4 py-2${block ? " w-full rounded-xl" : ""}`}
      style={{
        borderColor: checked ? BRAND : "#e5e7eb",
        background: checked ? BRAND : "white",
        color: checked ? "white" : "#374151",
        fontWeight: checked ? 600 : 400,
      }}
    >
      <input type="radio" className="sr-only" checked={checked} onChange={onChange} readOnly />
      {label}
    </label>
  )
}

function CheckTile({
  label,
  checked,
  onChange,
  locked,
}: {
  label: string
  checked: boolean
  onChange: () => void
  locked?: boolean
}) {
  return (
    <label
      className={`flex items-start gap-3 rounded-xl border p-3.5 transition-all duration-150 select-none text-sm leading-snug${locked ? " cursor-default" : " cursor-pointer"}`}
      style={{
        borderColor: checked ? BRAND : "#e5e7eb",
        background: checked ? "#e8eef8" : "white",
        color: "#111827",
      }}
    >
      <span
        className="mt-0.5 w-4 h-4 rounded flex items-center justify-center shrink-0 border-2 transition-all"
        style={{
          borderColor: checked ? BRAND : "#d1d5db",
          background: checked ? BRAND : "transparent",
        }}
      >
        {checked && (
          <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="2 6 5 9 10 3" />
          </svg>
        )}
      </span>
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={locked ? undefined : onChange}
        readOnly={locked}
      />
      <span>
        {label}
        {locked && (
          <span className="ml-2 text-[9px] font-bold px-1.5 py-0.5 rounded text-white align-middle" style={{ background: BRAND }}>
            必須選択
          </span>
        )}
      </span>
    </label>
  )
}

function ErrorMsg({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-1.5 text-xs text-red-500 mt-1">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      {children}
    </p>
  )
}
