import {
  Alert,
  AlertDescription,
  AlertIcon,
  Badge,
  Box,
  Button,
  Checkbox,
  createDisclosure,
  Divider,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spacer,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
  useColorModeValue,
  VStack,
} from "@hope-ui/solid"
import { createMemo, createSignal, For, JSX, Show } from "solid-js"
import { useFetch, useListFetch, useManageTitle, useT, useUtil } from "~/hooks"
import {
  createMyToken,
  handleResp,
  listMyTokens,
  notify,
  revokeMyToken,
  tokenVar,
} from "~/utils"
import {
  ACCESS_TOKEN_SCOPES,
  AccessToken,
  CreatedAccessToken,
  PPageResp,
  PResp,
  tokenIsActive,
  tokenScopes,
} from "~/types"

/**
 * Developer console: self-service personal access tokens (PATs).
 *
 * The backend reveals the raw `obk_…` secret exactly once, at creation, and
 * stores only its sha256 digest — so this page keeps the reveal in local
 * state and never tries to reconstruct it.
 */

const SCOPES: string[] = [...ACCESS_TOKEN_SCOPES]

const scopeLabelKey = (scope: string) =>
  `manage.pat.scopes.${scope.replace(":", "_")}`

/** `expires_in` is hours; 0 means the token never expires. */
const EXPIRY_OPTIONS = [
  { hours: 1, key: "manage.pat.expiry.1h" },
  { hours: 24, key: "manage.pat.expiry.24h" },
  { hours: 168, key: "manage.pat.expiry.7d" },
  { hours: 720, key: "manage.pat.expiry.30d" },
  { hours: 0, key: "manage.pat.expiry.never" },
] as const

/** Go writes zero times as 0001-01-01; treat anything ancient as missing. */
const formatTime = (value?: string | null) => {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime()) || date.getFullYear() < 100) return ""
  return date.toLocaleString()
}

type TokenState = "active" | "expired" | "revoked"

const stateOf = (token: AccessToken): TokenState => {
  if (token.revoked_at) return "revoked"
  if (token.expires_at && new Date(token.expires_at).getTime() < Date.now())
    return "expired"
  return "active"
}

const STATE_COLOR: Record<TokenState, "success" | "warning" | "neutral"> = {
  active: "success",
  expired: "warning",
  revoked: "neutral",
}

const StateBadge = (props: { state: TokenState }) => {
  const t = useT()
  return (
    <Badge colorScheme={STATE_COLOR[props.state]} variant="subtle">
      {t(`manage.pat.state.${props.state}`)}
    </Badge>
  )
}

/** Console card: title, optional actions, and a hairline-separated body. */
const Panel = (props: {
  title: string
  description?: string
  actions?: JSX.Element
  children: JSX.Element
}) => {
  const rule = useColorModeValue("$neutral3", "$neutral4")
  const surface = useColorModeValue("$background", "$neutral2")
  return (
    <Box
      as="section"
      w="$full"
      rounded="$lg"
      border={`1px solid ${tokenVar(rule())}`}
      bgColor={surface()}
      css={{ overflow: "hidden" }}
    >
      <HStack
        spacing="$3"
        px="$4"
        py="$3_5"
        alignItems="flex-start"
        css={{ flexWrap: "wrap" }}
      >
        <VStack
          spacing="$0_5"
          alignItems="start"
          css={{ flex: "1", minWidth: "180px" }}
        >
          <Heading size="sm">{props.title}</Heading>
          <Show when={props.description}>
            <Text fontSize="$sm" color="$neutral11" fontWeight="400">
              {props.description}
            </Text>
          </Show>
        </VStack>
        <Show when={props.actions}>{props.actions}</Show>
      </HStack>
      <Divider />
      <Box px="$4" py="$4">
        {props.children}
      </Box>
    </Box>
  )
}

const CodeBlock = (props: { code: string }) => {
  const t = useT()
  const { copy } = useUtil()
  const rule = useColorModeValue("$neutral3", "$neutral4")
  const fill = useColorModeValue("$neutral2", "$neutral3")
  return (
    <Box
      position="relative"
      rounded="$md"
      border={`1px solid ${tokenVar(rule())}`}
      bgColor={fill()}
    >
      <Box
        as="pre"
        m="$0"
        p="$3"
        pr="$5"
        css={{
          fontFamily: "$mono",
          fontVariantNumeric: "tabular-nums",
          fontSize: "12.5px",
          lineHeight: "1.6",
          color: "$neutral12",
          overflowX: "auto",
          whiteSpace: "pre",
        }}
      >
        {props.code}
      </Box>
      <Button
        position="absolute"
        top="$2"
        right="$2"
        size="xs"
        variant="ghost"
        colorScheme="neutral"
        onClick={() => copy(props.code)}
      >
        {t("manage.pat.copy_usage")}
      </Button>
    </Box>
  )
}

const Developer = () => {
  const t = useT()
  useManageTitle("manage.sidemenu.developer")
  const { copy } = useUtil()

  const [tokens, setTokens] = createSignal<AccessToken[]>([])
  const [listLoading, getList] = useFetch((): PPageResp<AccessToken> =>
    listMyTokens(1, 100),
  )
  const refresh = async () => {
    const resp = await getList()
    handleResp(resp, (data) => setTokens(data.content ?? []))
  }
  refresh()

  const [revokingId, doRevoke] = useListFetch((id: number) => revokeMyToken(id))

  // ---- creation ----------------------------------------------------------
  const { isOpen, onOpen, onClose } = createDisclosure()
  const [name, setName] = createSignal("")
  const [scopes, setScopes] = createSignal<string[]>(["fs:read"])
  const [expiresIn, setExpiresIn] = createSignal<number>(720)
  const [createLoading, doCreate] = useFetch((): PResp<CreatedAccessToken> =>
    createMyToken(name().trim(), scopes(), expiresIn()),
  )

  const nameTooLong = () => name().trim().length > 64
  const canSubmit = () =>
    name().trim().length > 0 && !nameTooLong() && scopes().length > 0

  /** Held in memory only; closing the alert or reloading loses it for good. */
  const [created, setCreated] = createSignal<CreatedAccessToken>()

  const toggleScope = (scope: string) => {
    setScopes((current) =>
      current.includes(scope)
        ? current.filter((item) => item !== scope)
        : [...current, scope],
    )
  }

  const submit = async () => {
    if (!canSubmit()) {
      notify.error(t("manage.pat.form_invalid"))
      return
    }
    const resp = await doCreate()
    handleResp(resp, (data) => {
      setCreated(data)
      setName("")
      setScopes(["fs:read"])
      setExpiresIn(720)
      onClose()
      refresh()
    })
  }

  const revoke = async (token: AccessToken) => {
    const resp = await doRevoke(token.id)
    handleResp(resp, () => {
      notify.success(t("manage.pat.revoke_success"))
      refresh()
    })
  }

  const usage = createMemo(() => {
    const sample = created()?.token ?? "obk_your_token_here"
    return [
      `curl -X POST ${location.origin}/api/fs/list \\`,
      `  -H "Authorization: Bearer ${sample}" \\`,
      `  -H "Content-Type: application/json" \\`,
      `  -d '{"path":"/","page":1,"per_page":100}'`,
    ].join("\n")
  })

  const mcpUsage = createMemo(() =>
    [
      "{",
      '  "mcpServers": {',
      '    "open-box": {',
      `      "url": "${location.origin}/mcp",`,
      '      "headers": { "Authorization": "Bearer obk_your_token_here" }',
      "    }",
      "  }",
      "}",
    ].join("\n"),
  )

  return (
    <VStack spacing="$4" alignItems="stretch" w="$full">
      <VStack spacing="$1" alignItems="start">
        <Heading size="lg" css={{ letterSpacing: "-.01em" }}>
          {t("manage.sidemenu.developer")}
        </Heading>
        <Text fontSize="$sm" color="$neutral11">
          {t("manage.pat.intro")}
        </Text>
      </VStack>

      <Show when={created()}>
        {(token) => (
          <Alert
            status="warning"
            variant="subtle"
            css={{ alignItems: "flex-start" }}
          >
            <AlertIcon />
            <AlertDescription w="$full">
              <VStack alignItems="flex-start" spacing="$2">
                <Text fontWeight="$semibold">
                  {t("manage.pat.reveal_title")}
                </Text>
                <HStack
                  spacing="$2"
                  alignItems="center"
                  w="$full"
                  css={{ flexWrap: "wrap" }}
                >
                  <Box
                    as="code"
                    px="$2"
                    py="$1"
                    rounded="$md"
                    bgColor="$neutral3"
                    css={{
                      fontFamily: "$mono",
                      fontSize: "13px",
                      wordBreak: "break-all",
                    }}
                  >
                    {token().token}
                  </Box>
                  <Button size="xs" onClick={() => copy(token().token)}>
                    {t("manage.pat.copy_token")}
                  </Button>
                  <Button
                    size="xs"
                    variant="ghost"
                    colorScheme="neutral"
                    onClick={() => setCreated(undefined)}
                  >
                    {t("manage.pat.dismiss")}
                  </Button>
                </HStack>
                <Text fontSize="$xs" color="$neutral11">
                  {t("manage.pat.reveal_hint")}
                </Text>
              </VStack>
            </AlertDescription>
          </Alert>
        )}
      </Show>

      <Panel
        title={t("manage.pat.tokens_title")}
        description={t("manage.pat.tokens_hint")}
        actions={
          <HStack spacing="$2">
            <Button
              size="sm"
              variant="outline"
              colorScheme="accent"
              loading={listLoading()}
              onClick={refresh}
            >
              {t("global.refresh")}
            </Button>
            <Button size="sm" colorScheme="accent" onClick={onOpen}>
              {t("manage.pat.create")}
            </Button>
          </HStack>
        }
      >
        <Box w="$full" overflowX="auto">
          <Table highlightOnHover dense>
            <Thead>
              <Tr>
                <Th>{t("manage.pat.col.name")}</Th>
                <Th>{t("manage.pat.col.token")}</Th>
                <Th>{t("manage.pat.col.scopes")}</Th>
                <Th>{t("manage.pat.col.state")}</Th>
                <Th>{t("manage.pat.col.created")}</Th>
                <Th>{t("manage.pat.col.last_used")}</Th>
                <Th numeric>{t("global.operations")}</Th>
              </Tr>
            </Thead>
            <Tbody>
              <Show
                when={tokens().length > 0}
                fallback={
                  <Tr>
                    <Td colSpan={7}>
                      <Text color="$neutral11" fontSize="$sm">
                        {listLoading()
                          ? t("manage.pat.loading")
                          : t("manage.pat.no_tokens")}
                      </Text>
                    </Td>
                  </Tr>
                }
              >
                <For each={tokens()}>
                  {(token) => {
                    const granted = () => tokenScopes(token.scopes)
                    const expires = formatTime(token.expires_at)
                    const usable = () => tokenIsActive(token)
                    return (
                      <Tr>
                        <Td>
                          <Text fontSize="$sm" fontWeight="$medium">
                            {token.name}
                          </Text>
                        </Td>
                        <Td>
                          <Text css={{ fontFamily: "$mono" }} fontSize="$xs">
                            {token.prefix}…
                          </Text>
                        </Td>
                        <Td>
                          <HStack
                            spacing="$1"
                            css={{ flexWrap: "wrap", maxWidth: "260px" }}
                          >
                            <For each={granted()}>
                              {(scope) => (
                                <Badge
                                  colorScheme="neutral"
                                  variant="subtle"
                                  fontSize="$xs"
                                >
                                  {t(scopeLabelKey(scope))}
                                </Badge>
                              )}
                            </For>
                          </HStack>
                        </Td>
                        <Td>
                          <VStack spacing="$0_5" alignItems="start">
                            <StateBadge state={stateOf(token)} />
                            <Show when={expires}>
                              <Text fontSize="$xs" color="$neutral11">
                                {t("manage.pat.expires_at")} {expires}
                              </Text>
                            </Show>
                          </VStack>
                        </Td>
                        <Td>
                          <Text fontSize="$xs" color="$neutral11">
                            {formatTime(token.created_at) || "—"}
                          </Text>
                        </Td>
                        <Td>
                          <Text fontSize="$xs" color="$neutral11">
                            {formatTime(token.last_used_time) ||
                              t("manage.pat.never_used")}
                          </Text>
                        </Td>
                        <Td numeric>
                          <Show
                            when={usable()}
                            fallback={
                              <Text fontSize="$xs" color="$neutral11">
                                —
                              </Text>
                            }
                          >
                            <Tooltip
                              label={t("manage.pat.revoke_tooltip")}
                              withArrow
                            >
                              <Button
                                size="xs"
                                variant="outline"
                                colorScheme="danger"
                                loading={revokingId() === token.id}
                                onClick={() => revoke(token)}
                              >
                                {t("manage.pat.revoke")}
                              </Button>
                            </Tooltip>
                          </Show>
                        </Td>
                      </Tr>
                    )
                  }}
                </For>
              </Show>
            </Tbody>
          </Table>
        </Box>
      </Panel>

      <Panel
        title={t("manage.pat.usage_title")}
        description={t("manage.pat.usage_hint")}
      >
        <VStack spacing="$3" alignItems="stretch">
          <CodeBlock code={usage()} />
          <Divider />
          <VStack spacing="$2" alignItems="stretch">
            <Text fontSize="$sm" color="$neutral11">
              {t("manage.pat.mcp_hint")}
            </Text>
            <CodeBlock code={mcpUsage()} />
          </VStack>
        </VStack>
      </Panel>

      <Modal opened={isOpen()} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalHeader>{t("manage.pat.create")}</ModalHeader>
          <ModalBody>
            <VStack spacing="$4" alignItems="stretch">
              <FormControl>
                <FormLabel for="pat_name">{t("manage.pat.col.name")}</FormLabel>
                <Input
                  id="pat_name"
                  maxLength={64}
                  placeholder={t("manage.pat.name_placeholder")}
                  value={name()}
                  onInput={(e) => setName(e.currentTarget.value)}
                />
                <Show when={nameTooLong()}>
                  <Text fontSize="$xs" color="$danger11" mt="$1">
                    {t("manage.pat.name_too_long")}
                  </Text>
                </Show>
              </FormControl>
              <FormControl>
                <FormLabel>{t("manage.pat.col.scopes")}</FormLabel>
                <VStack spacing="$2" alignItems="start" mt="$1">
                  <For each={SCOPES}>
                    {(scope) => (
                      <Checkbox
                        checked={scopes().includes(scope)}
                        onChange={() => toggleScope(scope)}
                        color="$neutral11"
                        fontSize="$sm"
                      >
                        <Box as="span" css={{ fontFamily: "$mono" }}>
                          {scope}
                        </Box>
                        <Text
                          as="span"
                          color="$neutral10"
                          fontSize="$xs"
                          ml="$1_5"
                        >
                          {t(`${scopeLabelKey(scope)}_hint`)}
                        </Text>
                      </Checkbox>
                    )}
                  </For>
                </VStack>
              </FormControl>
              <FormControl>
                <FormLabel>{t("manage.pat.expiry_label")}</FormLabel>
                <HStack spacing="$2" mt="$1" css={{ flexWrap: "wrap" }}>
                  <For each={EXPIRY_OPTIONS}>
                    {(option) => {
                      const selected = () => expiresIn() === option.hours
                      return (
                        <Button
                          size="xs"
                          variant={selected() ? "solid" : "outline"}
                          colorScheme={selected() ? "accent" : "neutral"}
                          onClick={() => setExpiresIn(option.hours)}
                        >
                          {t(option.key)}
                        </Button>
                      )
                    }}
                  </For>
                </HStack>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" colorScheme="neutral" onClick={onClose}>
              {t("global.cancel")}
            </Button>
            <Spacer />
            <Button
              colorScheme="accent"
              loading={createLoading()}
              disabled={!canSubmit()}
              onClick={submit}
            >
              {t("manage.pat.create")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  )
}

export default Developer
