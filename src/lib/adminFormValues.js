/**
 * 管理弹窗：读取 antd Form 当前值。
 * 调用方应先 await form.validateFields()，再读值，避免提交瞬间与控件不同步。
 *
 * 单字段必须以 getFieldValue 为准（与控件绑定一致）；仅用 getFieldsValue 聚合结果
 * 会在部分可选字段上出现「store 仍是旧值 / 空串，但输入框已改」导致提交错误（如校区 address）。
 * getFieldValue 为 undefined 时再回退到 getFieldsValue(true)（未挂载 name 等场景）。
 *
 * @param {*} form antd FormInstance
 * @param {string[]} names
 * @returns {Record<string, unknown>}
 */
export function readNamedFieldsFromForm(form, names) {
  let full = {}
  if (typeof form.getFieldsValue === 'function') {
    try {
      const raw = form.getFieldsValue(true)
      if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
        full = raw
      }
    } catch {
      full = {}
    }
  }
  const out = {}
  for (const name of names) {
    let gv
    if (typeof form.getFieldValue === 'function') {
      try {
        gv = form.getFieldValue(name)
      } catch {
        gv = undefined
      }
    }
    out[name] = gv !== undefined ? gv : full[name]
  }
  return out
}

/** 校验失败时 validateFields 抛出的结构，用于保存按钮 onClick 分支 */
export function isFormValidationError(e) {
  return Boolean(e && Array.isArray(e.errorFields) && e.errorFields.length > 0)
}
