import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BookReaderStorefrontModal } from "../BookReaderStorefrontModal";

describe("Public Book Reader & Author Storefront (BookReaderStorefrontModal.tsx)", () => {
  it("renders book title, reader excerpt, and purchase buttons", () => {
    render(
      <BookReaderStorefrontModal
        open={true}
        onOpenChange={() => {}}
        bookTitle="The Autonomous Co-Founder Blueprint"
      />
    );

    expect(screen.getByText(/The Autonomous Co-Founder Blueprint/i)).toBeInTheDocument();
    expect(screen.getByText(/Public Reader Storefront/i)).toBeInTheDocument();
    expect(screen.getByText(/Chapter 1: The Midnight Epiphany/i)).toBeInTheDocument();
    expect(screen.getByTestId("button-buy-ebook")).toBeInTheDocument();
    expect(screen.getByTestId("button-order-hardcover")).toBeInTheDocument();
  });

  it("handles instant e-book and physical hardcover COD orders", () => {
    render(
      <BookReaderStorefrontModal
        open={true}
        onOpenChange={() => {}}
        bookTitle="The Autonomous Co-Founder Blueprint"
      />
    );

    const buyEbookBtn = screen.getByTestId("button-buy-ebook");
    fireEvent.click(buyEbookBtn);

    expect(screen.getByText(/E-Book Purchased! ৳250 BDT collected/i)).toBeInTheDocument();

    const orderCodBtn = screen.getByTestId("button-order-hardcover");
    fireEvent.click(orderCodBtn);

    expect(screen.getByText(/Hardcover Book Ordered! Booked with Steadfast Courier/i)).toBeInTheDocument();
  });
});
