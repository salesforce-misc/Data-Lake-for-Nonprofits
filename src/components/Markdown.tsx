import { FC } from "react";
import { Heading, Link } from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { observer } from "mobx-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const Markdown: FC<{ content: string }> = observer(({ content }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        a: ({ ...props }) => (
          <Link href={props.href} isExternal color="red.600">
            {props.children} <ExternalLinkIcon mx="2px" />
          </Link>
        ),
        li: ({ ...props }) => <li style={{ marginLeft: "20px" }}>{props.children}</li>,
        h1: ({ ...props }) => (
          <Heading as="h1" size="lg" mt={4} mb={2}>
            {props.children}
          </Heading>
        ),
        h2: ({ ...props }) => (
          <Heading as="h2" size="md" mt={4} mb={2}>
            {props.children}
          </Heading>
        ),
        h3: ({ ...props }) => (
          <Heading as="h3" size="sm" mt={4} mb={2}>
            {props.children}
          </Heading>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
});
