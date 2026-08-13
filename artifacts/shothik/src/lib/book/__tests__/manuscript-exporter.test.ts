import { describe, it, expect } from 'vitest';
import {
  exportManuscriptDocument,
  calculatePhysicalPrintEstimate,
  createPhysicalPrintOrder,
  type ManuscriptExportPayload
} from '../manuscript-exporter';

describe('manuscript-exporter (Senior Demography-Aware Architecture)', () => {
  const samplePayload: ManuscriptExportPayload = {
    title: 'The Cyber River of Padma',
    author: 'Ahsan Habib',
    genre: 'Science Fiction',
    chapters: [
      {
        index: 1,
        title: 'Prologue: The Grid of Old Dhaka',
        content: 'Rain lashed against the fiber-optic pylons over Buriganga. The neon signs flickered in Bengali.'
      },
      {
        index: 2,
        title: 'Chapter 1: The Neural Ferry',
        content: 'Passengers tapped their bKash smart rings to board the automated hovercraft towards Barishal.'
      }
    ],
    metadata: {
      isbn: '978-984-9000-01-2',
      language: 'bn-BD',
      priceBdt: 450
    }
  };

  it('exports valid Markdown manuscript with clean front matter and TOC', async () => {
    const result = await exportManuscriptDocument(samplePayload, 'markdown');
    expect(result).toBeDefined();
    expect(result.filename).toBe('the-cyber-river-of-padma.md');
    expect(result.mimeType).toBe('text/markdown');
    expect(result.content).toContain('# The Cyber River of Padma');
    expect(result.content).toContain('## Table of Contents');
    expect(result.content).toContain('### Chapter 1: The Neural Ferry');
  });

  it('exports formatted HTML / Print-ready document with styling and typography', async () => {
    const result = await exportManuscriptDocument(samplePayload, 'html');
    expect(result).toBeDefined();
    expect(result.filename).toBe('the-cyber-river-of-padma.html');
    expect(result.mimeType).toBe('text/html');
    expect(result.content).toContain('<!DOCTYPE html>');
    expect(result.content).toContain('Ahsan Habib');
    expect(result.content).toContain('font-family:');
  });

  it('calculates physical print estimates and courier charges accurately', () => {
    const dhakaEstimate = calculatePhysicalPrintEstimate({
      wordCount: 45000,
      copies: 5,
      binding: 'paperback',
      deliveryZone: 'inside_dhaka'
    });

    expect(dhakaEstimate.pageCount).toBeGreaterThan(0);
    expect(dhakaEstimate.deliveryFeeBdt).toBe(60);
    expect(dhakaEstimate.totalBdt).toBeGreaterThan(0);

    const outsideDhakaEstimate = calculatePhysicalPrintEstimate({
      wordCount: 45000,
      copies: 5,
      binding: 'hardcover',
      deliveryZone: 'outside_dhaka'
    });

    expect(outsideDhakaEstimate.deliveryFeeBdt).toBe(120);
    expect(outsideDhakaEstimate.totalBdt).toBeGreaterThan(dhakaEstimate.totalBdt);
  });

  it('creates physical print order with Steadfast courier consignment and bKash MFS deep link', async () => {
    const order = await createPhysicalPrintOrder({
      payload: samplePayload,
      customerName: 'Rahim Chowdhury',
      phone: '01712345678',
      deliveryAddress: 'House 12, Road 4, Dhanmondi, Dhaka',
      deliveryZone: 'inside_dhaka',
      copies: 2,
      binding: 'paperback',
      paymentMethod: 'bkash'
    });

    expect(order.orderId).toBeDefined();
    expect(order.courierTrackingId).toMatch(/^BD_STEADFAST_\d+/);
    expect(order.paymentLink).toContain('pay.bkash.com.bd');
    expect(order.status).toBe('pending_payment');
  });
});
