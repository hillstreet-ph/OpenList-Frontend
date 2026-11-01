import { useColorModeValue } from "@hope-ui/solid"

export const hoverColor = () => "rgba(132,133,141,0.18)"

/**
 * Hope UI only expands a `$token` when it is the entire value, so compound
 * values such as borders and shadows must reference the generated custom
 * property instead — `1px solid $neutral3` would reach the browser verbatim.
 */
export const tokenVar = (token: string) =>
  `var(--hope-colors-${token.replace(/^\$/, "")})`

export const alphaColor = (level: number, reverse = false) => {
  if (reverse) {
    return useColorModeValue(`$blackAlpha${level}`, `whiteAlpha${level}`)()
  }
  return useColorModeValue(`$whiteAlpha${level}`, `blackAlpha${level}`)()
}

export const alphaBgColor = () =>
  useColorModeValue("$whiteAlpha10", "$blackAlpha11")()
