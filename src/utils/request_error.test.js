import test from "node:test"

import assert from "node:assert/strict"
import { describeRequestError } from "./request_error.ts"

test("没有 HTTP 状态时给出可行动的重试提示，而不是浏览器的中止文案", () => {
  const msg = describeRequestError({
    fallback: "The operation either timed out or was not allowed.",
  })
  assert.match(msg, /did not answer/)
  assert.doesNotMatch(msg, /timed out or was not allowed/)
})

test("主动取消的请求不伪装成故障", () => {
  assert.equal(
    describeRequestError({
      cancelled: true,
      fallback: "canceled",
    }),
    "The request was cancelled.",
  )
  // 取消优先于状态：调用方 abort 时 axios 也可能带上已收到的状态码
  assert.equal(
    describeRequestError({ status: 500, cancelled: true, fallback: "boom" }),
    "The request was cancelled.",
  )
})

test("网关类状态说明是暂时不可用", () => {
  for (const status of [502, 503, 504]) {
    const msg = describeRequestError({ status })
    assert.match(msg, /temporarily unavailable/)
    assert.match(msg, new RegExp(String(status)))
  }
})

test("其他 HTTP 状态沿用 axios 的原始信息，缺省时退回状态码说明", () => {
  assert.equal(
    describeRequestError({
      status: 404,
      fallback: "Request failed with status code 404",
    }),
    "Request failed with status code 404",
  )
  assert.match(describeRequestError({ status: 400 }), /failed \(400\)/)
})

test("状态 0 与空消息不会被当成“没有状态”", () => {
  // status === 0 仍是一次真实的回复（部分网关会返回 0），不能被误判为断网
  assert.equal(
    describeRequestError({ status: 0, fallback: "network-ish" }),
    "network-ish",
  )
})
