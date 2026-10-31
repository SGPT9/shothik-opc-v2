import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { RoomShareModal } from '../RoomShareModal';
import { PlotBranchModal } from '../PlotBranchModal';
import { AuthorshipCertificateModal } from '../AuthorshipCertificateModal';
import { PodcastAudioModal } from '../PodcastAudioModal';
import { ResumableUploadModal } from '../ResumableUploadModal';

describe('DeepTech Studio Modals', () => {
  it('renders RoomShareModal and displays access mode options', () => {
    render(
      <RoomShareModal
        isOpen={true}
        onClose={vi.fn()}
        projectId="proj-test-101"
        projectTitle="Bengali Science Fiction"
      />
    );

    expect(screen.getByText(/Live Collaboration & Room Passcode/i)).toBeInTheDocument();
    expect(screen.getByText(/^Public$/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Passcode/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/^Private$/i)).toBeInTheDocument();
  });

  it('renders PlotBranchModal and allows typing a new branch', () => {
    render(
      <PlotBranchModal
        isOpen={true}
        onClose={vi.fn()}
        projectId="proj-test-101"
        projectTitle="Bengali Science Fiction"
      />
    );

    expect(screen.getByText(/Git for Writers/i)).toBeInTheDocument();
    const input = screen.getByPlaceholderText(/Alternative Climax Scene/i);
    expect(input).toBeInTheDocument();
    fireEvent.change(input, { target: { value: 'Cyberpunk Ending' } });
    expect((input as HTMLInputElement).value).toBe('Cyberpunk Ending');
  });

  it('renders AuthorshipCertificateModal with Merkle root hash and certificate details', () => {
    render(
      <AuthorshipCertificateModal
        isOpen={true}
        onClose={vi.fn()}
        projectId="proj-test-101"
        projectTitle="Bengali Science Fiction"
        authorName="Tareq Masud"
      />
    );

    expect(screen.getByText(/Proof of Authorship & Copyright Certificate/i)).toBeInTheDocument();
    expect(screen.getByText(/IMMUTABLE ANCHOR/i)).toBeInTheDocument();
    expect(screen.getByText(/Tareq Masud/i)).toBeInTheDocument();
    expect(screen.getByText(/Merkle Root Hash/i)).toBeInTheDocument();
  });

  it('renders PodcastAudioModal with waveform player and episodes', () => {
    render(
      <PodcastAudioModal
        isOpen={true}
        onClose={vi.fn()}
        projectId="proj-test-101"
        projectTitle="Bengali Science Fiction"
        chapters={[
          { id: 'ch-1', title: 'Chapter 1: The Machine Awakens', wordCount: 1500 },
        ]}
      />
    );

    expect(screen.getByText(/Automated Audiobook Podcast Feed/i)).toBeInTheDocument();
    expect(screen.getByText(/Public Apple Podcasts RSS Feed/i)).toBeInTheDocument();
    expect(screen.getByText(/Chapter 1: The Machine Awakens/i)).toBeInTheDocument();
  });

  it('renders ResumableUploadModal with drop zone', () => {
    render(
      <ResumableUploadModal
        isOpen={true}
        onClose={vi.fn()}
        bucket="academic-manuscripts"
      />
    );

    expect(screen.getByText(/Resumable Chunked Upload \(TUS Protocol\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Choose heavy PDF thesis or audio recording/i)).toBeInTheDocument();
  });
});
