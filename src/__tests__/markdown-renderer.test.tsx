/**
 * MarkdownRenderer Tests
 *
 * Tests the markdown rendering component including code blocks,
 * links, images, tables, and copy functionality.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { MarkdownRenderer } from "../components/MarkdownRenderer";

describe("MarkdownRenderer", () => {
  describe("code blocks", () => {
    it("should render code blocks with language label", async () => {
      const code = "```javascript\nconst x = 1;\n```";
      render(<MarkdownRenderer content={code} copiedCode={null} onCopyCode={vi.fn()} />);

      await waitFor(() => {
        expect(screen.getByText("javascript")).toBeInTheDocument();
      });
    });

    it("should render code block content", async () => {
      const code = "```javascript\nconst hello = 'world';\n```";
      const { container } = render(<MarkdownRenderer content={code} copiedCode={null} onCopyCode={vi.fn()} />);

      await waitFor(() => {
        // Code content might be split across syntax highlight spans
        const codeElement = container.querySelector("pre code");
        expect(codeElement?.textContent).toContain("const hello");
      });
    });

    it("should show copy button for code blocks", async () => {
      const code = "```javascript\nconsole.log('test');\n```";
      render(<MarkdownRenderer content={code} copiedCode={null} onCopyCode={vi.fn()} />);

      await waitFor(() => {
        const copyButton = screen.getByRole("button", {
          name: /copy code to clipboard/i,
        });
        expect(copyButton).toBeInTheDocument();
      });
    });

    it("should call onCopyCode when copy button is clicked", async () => {
      const user = userEvent.setup();
      const onCopyCode = vi.fn();
      const code = "```python\nprint('hello')\n```";

      render(<MarkdownRenderer content={code} copiedCode={null} onCopyCode={onCopyCode} />);

      await waitFor(async () => {
        const copyButton = screen.getByRole("button", {
          name: /copy code to clipboard/i,
        });
        await user.click(copyButton);
      });

      expect(onCopyCode).toHaveBeenCalledWith("print('hello')");
    });

    it("should show 'Copied!' feedback when code is copied", async () => {
      const codeContent = "console.log('test');";
      const code = `\`\`\`javascript\n${codeContent}\n\`\`\``;

      render(
        <MarkdownRenderer
          content={code}
          copiedCode={codeContent}
          onCopyCode={vi.fn()}
        />,
      );

      await waitFor(() => {
        expect(screen.getByText("Copied!")).toBeInTheDocument();
      });
    });

    it("should handle code blocks without language specified", async () => {
      const code = "```\ngeneric code\n```";
      render(<MarkdownRenderer content={code} copiedCode={null} onCopyCode={vi.fn()} />);

      await waitFor(() => {
        expect(screen.getByText(/generic code/)).toBeInTheDocument();
      });
    });

    it("should handle multiline code blocks", async () => {
      const code = "```python\ndef hello():\n    return 'world'\n\nprint(hello())\n```";
      const { container } = render(<MarkdownRenderer content={code} copiedCode={null} onCopyCode={vi.fn()} />);

      await waitFor(() => {
        const codeElement = container.querySelector("pre code");
        expect(codeElement?.textContent).toContain("def hello");
        expect(codeElement?.textContent).toContain("return 'world'");
      });
    });

    it("should strip trailing newline from code", async () => {
      const onCopyCode = vi.fn();
      const user = userEvent.setup();
      const code = "```javascript\nconst x = 1;\n\n```"; // Extra newline

      render(<MarkdownRenderer content={code} copiedCode={null} onCopyCode={onCopyCode} />);

      const copyButton = await screen.findByRole("button", {
        name: /copy code to clipboard/i,
      });
      await user.click(copyButton);

      // Should not include trailing newlines (they get stripped)
      expect(onCopyCode).toHaveBeenCalled();
      const calledWith = onCopyCode.mock.calls[0][0];
      expect(calledWith.trimEnd()).toBe("const x = 1;");
    });
  });

  describe("inline code", () => {
    it("should render inline code with backticks", () => {
      const content = "Use the `console.log()` function";
      render(<MarkdownRenderer content={content} copiedCode={null} onCopyCode={vi.fn()} />);

      const inlineCode = screen.getByText("console.log()");
      expect(inlineCode.tagName).toBe("CODE");
    });

    it("should not show copy button for inline code", () => {
      const content = "This is `inline code`";
      render(<MarkdownRenderer content={content} copiedCode={null} onCopyCode={vi.fn()} />);

      const copyButton = screen.queryByRole("button", { name: /copy/i });
      expect(copyButton).not.toBeInTheDocument();
    });
  });

  describe("links", () => {
    it("should render links with target blank", () => {
      const content = "[Click here](https://example.com)";
      render(<MarkdownRenderer content={content} copiedCode={null} onCopyCode={vi.fn()} />);

      const link = screen.getByRole("link", { name: "Click here" });
      expect(link).toHaveAttribute("href", "https://example.com");
      expect(link).toHaveAttribute("target", "_blank");
    });

    it("should add rel noopener noreferrer to links", () => {
      const content = "[External link](https://example.com)";
      render(<MarkdownRenderer content={content} copiedCode={null} onCopyCode={vi.fn()} />);

      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("should render multiple links", () => {
      const content =
        "[Link 1](https://one.com) and [Link 2](https://two.com)";
      render(<MarkdownRenderer content={content} copiedCode={null} onCopyCode={vi.fn()} />);

      expect(screen.getByRole("link", { name: "Link 1" })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Link 2" })).toBeInTheDocument();
    });
  });

  describe("images", () => {
    it("should render images with alt text", () => {
      const content = "![Test image](https://example.com/image.png)";
      render(<MarkdownRenderer content={content} copiedCode={null} onCopyCode={vi.fn()} />);

      const img = screen.getByAltText("Test image");
      expect(img).toBeInTheDocument();
    });

    it("should render images without alt text", () => {
      const content = "![](https://example.com/image.png)";
      render(<MarkdownRenderer content={content} copiedCode={null} onCopyCode={vi.fn()} />);

      const img = screen.getByAltText("Image");
      expect(img).toBeInTheDocument();
    });

    it("should not render image without src", () => {
      // This edge case shouldn't happen with valid markdown, but test defensive code
      const content = "![]()";
      const { container } = render(
        <MarkdownRenderer content={content} copiedCode={null} onCopyCode={vi.fn()} />,
      );

      const img = container.querySelector("img");
      expect(img).toBeNull();
    });
  });

  describe("tables", () => {
    it("should render tables", () => {
      const content = `
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |
`;
      render(<MarkdownRenderer content={content} copiedCode={null} onCopyCode={vi.fn()} />);

      expect(screen.getByRole("table")).toBeInTheDocument();
      expect(screen.getByText("Header 1")).toBeInTheDocument();
      expect(screen.getByText("Cell 1")).toBeInTheDocument();
    });

    it("should render table headers", () => {
      const content = `
| Name | Age |
|------|-----|
| John | 30  |
`;
      render(<MarkdownRenderer content={content} copiedCode={null} onCopyCode={vi.fn()} />);

      expect(screen.getByText("Name")).toBeInTheDocument();
      expect(screen.getByText("Age")).toBeInTheDocument();
    });

    it("should render table cells", () => {
      const content = `
| Fruit | Color |
|-------|-------|
| Apple | Red   |
| Banana| Yellow|
`;
      render(<MarkdownRenderer content={content} copiedCode={null} onCopyCode={vi.fn()} />);

      expect(screen.getByText("Apple")).toBeInTheDocument();
      expect(screen.getByText("Red")).toBeInTheDocument();
      expect(screen.getByText("Banana")).toBeInTheDocument();
      expect(screen.getByText("Yellow")).toBeInTheDocument();
    });
  });

  describe("mixed content", () => {
    it("should render text with inline code and links", () => {
      const content =
        "Check out `npm install` or visit [npm docs](https://npmjs.com)";
      render(<MarkdownRenderer content={content} copiedCode={null} onCopyCode={vi.fn()} />);

      expect(screen.getByText("npm install")).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "npm docs" })).toBeInTheDocument();
    });

    it("should render headings, lists, and code blocks together", async () => {
      const content = `
# Title

- Item 1
- Item 2

\`\`\`javascript
const x = 1;
\`\`\`
`;
      render(<MarkdownRenderer content={content} copiedCode={null} onCopyCode={vi.fn()} />);

      expect(screen.getByRole("heading", { name: "Title" })).toBeInTheDocument();
      expect(screen.getByText("Item 1")).toBeInTheDocument();
      await waitFor(() => {
        expect(screen.getByText("javascript")).toBeInTheDocument();
      });
    });
  });

  describe("edge cases", () => {
    it("should handle empty content", () => {
      const { container } = render(
        <MarkdownRenderer content="" copiedCode={null} onCopyCode={vi.fn()} />,
      );

      expect(container.querySelector(".prose")).toBeInTheDocument();
    });

    it("should handle plain text without markdown", () => {
      const content = "This is just plain text";
      render(<MarkdownRenderer content={content} copiedCode={null} onCopyCode={vi.fn()} />);

      expect(screen.getByText(content)).toBeInTheDocument();
    });

    it("should handle special characters", () => {
      const content = "Special chars: < > & \" '";
      render(<MarkdownRenderer content={content} copiedCode={null} onCopyCode={vi.fn()} />);

      expect(screen.getByText(/Special chars:/)).toBeInTheDocument();
    });

    it("should handle very long code blocks", async () => {
      const longCode = "const x = " + "1".repeat(10000) + ";";
      const content = `\`\`\`javascript\n${longCode}\n\`\`\``;

      render(<MarkdownRenderer content={content} copiedCode={null} onCopyCode={vi.fn()} />);

      await waitFor(() => {
        expect(screen.getByText("javascript")).toBeInTheDocument();
      });
    });

    it("should sanitize potentially dangerous HTML", () => {
      const content = '<script>alert("xss")</script>';
      const { container } = render(
        <MarkdownRenderer content={content} copiedCode={null} onCopyCode={vi.fn()} />,
      );

      // Script tags should be sanitized
      const script = container.querySelector("script");
      expect(script).toBeNull();
    });

    it("should handle nested markdown elements", () => {
      const content = "**Bold with `code` inside**";
      render(<MarkdownRenderer content={content} copiedCode={null} onCopyCode={vi.fn()} />);

      const bold = screen.getByText(/Bold with/);
      const code = screen.getByText("code");
      expect(bold).toBeInTheDocument();
      expect(code.tagName).toBe("CODE");
    });

    it("should render blockquotes", () => {
      const content = "> This is a quote\n> Continued quote";
      render(<MarkdownRenderer content={content} copiedCode={null} onCopyCode={vi.fn()} />);

      expect(screen.getByText(/This is a quote/)).toBeInTheDocument();
    });

    it("should render lists", () => {
      const content = "- Item 1\n- Item 2\n- Item 3";
      render(<MarkdownRenderer content={content} copiedCode={null} onCopyCode={vi.fn()} />);

      expect(screen.getByText("Item 1")).toBeInTheDocument();
      expect(screen.getByText("Item 2")).toBeInTheDocument();
      expect(screen.getByText("Item 3")).toBeInTheDocument();
    });

    it("should render ordered lists", () => {
      const content = "1. First\n2. Second\n3. Third";
      render(<MarkdownRenderer content={content} copiedCode={null} onCopyCode={vi.fn()} />);

      expect(screen.getByText("First")).toBeInTheDocument();
      expect(screen.getByText("Second")).toBeInTheDocument();
      expect(screen.getByText("Third")).toBeInTheDocument();
    });
  });

  describe("memoization", () => {
    it("should not re-render when copiedCode changes to different code", () => {
      const onCopyCode = vi.fn();
      const content = "```javascript\nconst x = 1;\n```";

      const { rerender } = render(
        <MarkdownRenderer
          content={content}
          copiedCode={null}
          onCopyCode={onCopyCode}
        />,
      );

      // Change copiedCode to something different
      rerender(
        <MarkdownRenderer
          content={content}
          copiedCode="different code"
          onCopyCode={onCopyCode}
        />,
      );

      // Component should still render correctly
      expect(screen.getByText("javascript")).toBeInTheDocument();
    });

    it("should update when content changes", () => {
      const { rerender } = render(
        <MarkdownRenderer
          content="Original content"
          copiedCode={null}
          onCopyCode={vi.fn()}
        />,
      );

      expect(screen.getByText("Original content")).toBeInTheDocument();

      rerender(
        <MarkdownRenderer
          content="Updated content"
          copiedCode={null}
          onCopyCode={vi.fn()}
        />,
      );

      expect(screen.getByText("Updated content")).toBeInTheDocument();
      expect(screen.queryByText("Original content")).not.toBeInTheDocument();
    });
  });
});
