import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import {
  Skeleton,
  ConversationSkeleton,
  MessageSkeleton,
  WelcomeSkeletonCard,
} from "./skeleton";

describe("Skeleton", () => {
  it("should render basic skeleton", () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.firstChild as HTMLElement;
    
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveClass("animate-pulse");
    expect(skeleton).toHaveClass("rounded-md");
    expect(skeleton).toHaveClass("bg-muted/50");
  });

  it("should apply custom className", () => {
    const { container } = render(<Skeleton className="custom-class" />);
    const skeleton = container.firstChild as HTMLElement;
    
    expect(skeleton).toHaveClass("custom-class");
  });

  it("should have aria-hidden attribute", () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.firstChild as HTMLElement;
    
    expect(skeleton).toHaveAttribute("aria-hidden", "true");
  });
});

describe("ConversationSkeleton", () => {
  it("should render conversation skeleton structure", () => {
    const { container } = render(<ConversationSkeleton />);
    
    // Should have multiple skeleton elements
    const skeletons = container.querySelectorAll('[aria-hidden="true"]');
    expect(skeletons.length).toBeGreaterThan(1);
  });

  it("should have animation classes", () => {
    const { container } = render(<ConversationSkeleton />);
    const wrapper = container.firstChild as HTMLElement;
    
    expect(wrapper).toHaveClass("animate-in");
    expect(wrapper).toHaveClass("fade-in");
  });
});

describe("MessageSkeleton", () => {
  it("should render message skeleton for assistant", () => {
    const { container } = render(<MessageSkeleton />);
    const wrapper = container.firstChild as HTMLElement;
    
    expect(wrapper).toHaveClass("flex");
    expect(wrapper).toHaveClass("gap-3");
    expect(wrapper).not.toHaveClass("flex-row-reverse");
  });

  it("should render message skeleton for user with reversed layout", () => {
    const { container } = render(<MessageSkeleton isUser={true} />);
    const wrapper = container.firstChild as HTMLElement;
    
    expect(wrapper).toHaveClass("flex-row-reverse");
  });

  it("should include avatar skeleton", () => {
    const { container } = render(<MessageSkeleton />);
    
    // Avatar is the first skeleton element
    const skeletons = container.querySelectorAll('[aria-hidden="true"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("should include content skeletons", () => {
    const { container } = render(<MessageSkeleton />);
    
    // Should have multiple skeleton lines for content
    const skeletons = container.querySelectorAll('[aria-hidden="true"]');
    expect(skeletons.length).toBeGreaterThan(3);
  });
});

describe("WelcomeSkeletonCard", () => {
  it("should render welcome skeleton card structure", () => {
    const { container } = render(<WelcomeSkeletonCard />);
    const card = container.firstChild as HTMLElement;
    
    expect(card).toHaveClass("rounded-xl");
    expect(card).toHaveClass("border");
  });

  it("should include icon and text skeletons", () => {
    const { container } = render(<WelcomeSkeletonCard />);
    
    const skeletons = container.querySelectorAll('[aria-hidden="true"]');
    expect(skeletons.length).toBeGreaterThan(2);
  });
});
