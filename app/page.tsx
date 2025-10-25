"use client"; 
import React, { useState, ComponentType, SVGProps } from 'react';

import { 
  Users, 
  Brain, 
  CheckCircle, 
  AlertTriangle,
  ArrowLeft,
  Loader2,
  Database,
  ShieldCheck,
  Plus
} from '@/components/icons'; // Adjusted import path

// --- TypeScript Type Definitions ---
// This is what you'll explain to the judges!

interface Sbt {
  name: string;
  wallet?: string; // Wallet address is optional for this demo
  verified?: boolean;
}

interface Ownership {
  sbt: Sbt;
  share: number;
}

interface Asset {
  id: number;
  title: string;
  type: string;
  imageUrl: string;
  creator: Sbt;
  ownership: Ownership[];
  currentLicense: string;
}

interface Proposal {
  id: number;
  assetId: number;
  title: string;
  proposer: string;
  offer: string;
  description: string;
  status: "Pending" | "Passed" | "Failed";
}

type AiAnalysisItem = {
  status: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  color: string;
  text: string;
};

interface AiAnalysis {
  proposalId: number;
  compliance: AiAnalysisItem;
  strategy: AiAnalysisItem;
  risk: AiAnalysisItem;
}

// --- Hard-coded "Blockchain" Data ---

const CREATOR_SBT: Sbt = {
  name: "Shri Sharma",
  wallet: "0x...SBT_Identity",
  verified: true,
};

const INITIAL_ASSETS: Asset[] = [
  {
    id: 1,
    title: "Celestial Echo",
    type: "AI-Generated Artwork",
    imageUrl: "https://placehold.co/600x400/6366F1/FFFFFF?text=Celestial+Echo",
    creator: CREATOR_SBT,
    ownership: [
      { sbt: CREATOR_SBT, share: 40 },
      { sbt: { name: "Uthkarsh M." }, share: 20 },
      { sbt: { name: "Public DAO" }, share: 40 },
    ],
    currentLicense: "Default 5% Public Royalty",
  },
  {
    id: 2,
    title: "Quantum Lullaby",
    type: "Generative Music Track",
    imageUrl: "https://placehold.co/600x400/EC4899/FFFFFF?text=Quantum+Lullaby",
    creator: CREATOR_SBT,
    ownership: [
      { sbt: CREATOR_SBT, share: 100 },
    ],
    currentLicense: "Default 5% Public Royalty",
  },
];

const INITIAL_PROPOSALS: Proposal[] = [
  {
    id: 101,
    assetId: 1,
    title: "Exclusive License Offer: 'GameStudio X'",
    proposer: "0x...GameStudio",
    offer: "$25,000 (Flat Buyout)",
    description: "GameStudio X offers a one-time payment of $25,000 for a perpetual, exclusive license to use 'Celestial Echo' in their upcoming AAA game 'Nebula's End'. This will void all other royalty structures.",
    status: "Pending",
  },
  {
    id: 102,
    assetId: 1,
    title: "Non-Exclusive License: 'Indie Film'",
    proposer: "0x...IndieFilms",
    offer: "$500 + 3% Revenue Share",
    description: "Offer for a non-exclusive license for a short film.",
    status: "Passed",
  }
];

// This is your "Magic" - the hard-coded AI Legal-Brain Analysis
const AI_ANALYSIS: AiAnalysis = {
  proposalId: 101,
  compliance: {
    status: "PASSED",
    icon: CheckCircle,
    color: "text-green-500",
    text: "Proposal terms are compliant with EU Digital Services Act & US DMCA safe harbor.",
  },
  strategy: {
    status: "RECOMMEND ACCEPT",
    icon: AlertTriangle,
    color: "text-yellow-500",
    text: "This $25,000 flat-fee represents a 170% premium over current 12-month projected market value for similar assets.",
  },
  risk: {
    status: "HIGH-RISK / HIGH-REWARD",
    icon: AlertTriangle,
    color: "text-red-500",
    text: "Accepting this deal locks in a high profit but sacrifices all future royalty streams permanently. This is an irreversible decision.",
  }
};

// --- Main App Component ---

type PageState = 'dashboard' | 'asset' | 'proposal';
type VoteStatus = 'idle' | 'voting' | 'voted';

export default function Home() { 
  const [page, setPage] = useState<PageState>('dashboard');
  const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);
  const [selectedProposalId, setSelectedProposalId] = useState<number | null>(null);
  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS);
  const [proposals, setProposals] = useState<Proposal[]>(INITIAL_PROPOSALS);
  const [voteStatus, setVoteStatus] = useState<VoteStatus>('idle');
  
  const selectedAsset = assets.find(a => a.id === selectedAssetId);
  const selectedProposal = proposals.find(p => p.id === selectedProposalId);
  const assetProposals = proposals.filter(p => p.assetId === selectedAssetId);

  const handleSelectAsset = (id: number) => {
    setSelectedAssetId(id);
    setPage('asset');
  };

  const handleSelectProposal = (id: number) => {
    setSelectedProposalId(id);
    setVoteStatus('idle');
    setPage('proposal');
  };

  const handleBack = (toPage: PageState) => {
    setPage(toPage);
  };

  const handleVote = () => {
    setVoteStatus('voting');
    setTimeout(() => {
      setVoteStatus('voted');
      // Simulate the proposal passing
      setProposals(proposals.map(p => 
        p.id === selectedProposalId ? { ...p, status: "Passed" } : p
      ));
      // Simulate the license changing
      setAssets(assets.map(a => 
        a.id === selectedAssetId ? { ...a, currentLicense: "Exclusive License: 'GameStudio X'" } : a
      ));
    }, 2500);
  };
  
  const PageRouter = () => {
    switch(page) {
      case 'dashboard':
        return <DashboardPage onSelectAsset={handleSelectAsset} />;
      case 'asset':
        if (!selectedAsset) return <DashboardPage onSelectAsset={handleSelectAsset} />;
        return <AssetPage 
                  asset={selectedAsset} 
                  proposals={assetProposals} 
                  onSelectProposal={handleSelectProposal} 
                  onBack={() => handleBack('dashboard')} 
                />;
      case 'proposal':
        if (!selectedProposal || !selectedAsset) return <DashboardPage onSelectAsset={handleSelectAsset} />;
        return <ProposalPage 
                  proposal={selectedProposal} 
                  asset={selectedAsset} 
                  onBack={() => handleBack('asset')} 
                  onVote={handleVote}
                  voteStatus={voteStatus}
                />;
      default:
        return <DashboardPage onSelectAsset={handleSelectAsset} />;
    }
  }

  return (
    // The gradient background is now in globals.css, applied to the <body>
    <div className="min-h-screen w-full font-sans text-gray-900">
      <Header />
      <main className="max-w-7xl mx-auto p-4 md:p-8">
        <PageRouter />
      </main>
      <Footer />
    </div>
  );
}

// --- Components ---

function Header() {
  return (
    <header className="border-b border-gray-200 bg-white/50 backdrop-blur-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          {/* This is now an Image tag pointing to /logo.png in your public folder */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png" // Assumes your logo is in public/logo.png
            alt="Pramaan Portal Logo"
            width={40} // 10 * 4 (w-10)
            height={40} // 10 * 4 (h-10)
            className="rounded-full" // Optional: if your logo image isn't already round
          />
          <span className="text-2xl font-bold text-indigo-900">Pramaan Portal</span>
        </div>
        <div className="flex items-center gap-3">
            <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
            <Plus width={18} height={18} />
            Mint Asset
            </button>
          <div className="px-4 py-2 border border-gray-300 rounded-lg">
            <span className="font-medium text-gray-700">Connected: </span>
            <span className="font-mono text-indigo-600">0x...SBT</span>
          </div>
        </div>
      </nav>
    </header>
  );
}

// --- Dashboard Components ---

interface DashboardPageProps {
  onSelectAsset: (id: number) => void;
}

function DashboardPage({ onSelectAsset }: DashboardPageProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Asset Dashboard</h1>
        <button className="flex sm:hidden items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
          <Plus width={18} height={18} />
          Mint Asset
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {INITIAL_ASSETS.map(asset => (
          <AssetCard key={asset.id} asset={asset} onSelectAsset={onSelectAsset} />
        ))}
      </div>
    </div>
  );
}

interface AssetCardProps {
  asset: Asset;
  onSelectAsset: (id: number) => void;
}

function AssetCard({ asset, onSelectAsset }: AssetCardProps) {
  return (
    <div 
      className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer"
      onClick={() => onSelectAsset(asset.id)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={asset.imageUrl} alt={asset.title} className="w-full h-48 object-cover" />
      <div className="p-5">
        <h2 className="text-xl font-bold mb-1">{asset.title}</h2>
        <p className="text-sm text-indigo-600 font-medium mb-3">{asset.type}</p>
        <p className="text-sm text-gray-600 mb-4">
          <span className="font-medium">Creator:</span> {asset.creator.name} (Verified)
        </p>
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium text-gray-700">Current License:</span>
          <span className="text-sm font-medium text-blue-600">{asset.currentLicense}</span>
        </div>
      </div>
    </div>
  );
}

// --- Asset Page Components ---

interface AssetPageProps {
  asset: Asset;
  proposals: Proposal[];
  onSelectProposal: (id: number) => void;
  onBack: () => void;
}

function AssetPage({ asset, proposals, onSelectProposal, onBack }: AssetPageProps) {
  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 text-indigo-600 font-medium mb-4 hover:underline">
        <ArrowLeft width={18} height={18} />
        Back to Dashboard
      </button>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Image & Details */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset.imageUrl} alt={asset.title} className="w-full h-96 object-cover rounded-lg mb-6" />
          <h1 className="text-4xl font-bold mb-2">{asset.title}</h1>
          <p className="text-lg text-indigo-600 font-medium mb-6">{asset.type}</p>
          
          <div className="space-y-4">
            <InfoCard icon={ShieldCheck} title="Verified Creator" value={`${asset.creator.name} (${asset.creator.wallet})`} />
            <InfoCard icon={Database} title="Current License" value={asset.currentLicense} />
          </div>
        </div>
        
        {/* Right Column: Ownership & Proposals */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Users width={18} height={18} /> Ownership (DAO)</h3>
            <ul className="space-y-2">
              {asset.ownership.map(owner => (
                <li key={owner.sbt.name} className="flex justify-between items-center text-sm">
                  <span className="text-gray-700">{owner.sbt.name}</span>
                  <span className="font-bold text-indigo-800">{owner.share}%</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4">Proposals</h3>
            <div className="space-y-3">
              {proposals.length === 0 && <p className="text-sm text-gray-500">No proposals found.</p>}
              {proposals.map(proposal => (
                <ProposalCard key={proposal.id} proposal={proposal} onSelectProposal={onSelectProposal} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface InfoCardProps {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  value: string;
}

function InfoCard({ icon: Icon, title, value }: InfoCardProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <h4 className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-1"><Icon width={18} height={18} /> {title}</h4>
      <p className="text-md font-medium text-gray-900">{value}</p>
    </div>
  );
}

interface ProposalCardProps {
  proposal: Proposal;
  onSelectProposal: (id: number) => void;
}

function ProposalCard({ proposal, onSelectProposal }: ProposalCardProps) {
  const statusColors = {
    Pending: "bg-yellow-100 text-yellow-800",
    Passed: "bg-green-100 text-green-800",
    Failed: "bg-red-100 text-red-800",
  };
  
  return (
    <div 
      className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={() => onSelectProposal(proposal.id)}
    >
      <div className="flex justify-between items-center mb-1">
        <h5 className="font-bold text-indigo-700">{proposal.title}</h5>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[proposal.status]}`}>
          {proposal.status}
        </span>
      </div>
      <p className="text-sm text-gray-600">{proposal.offer}</p>
    </div>
  );
}

// --- Proposal Page Components ---

interface ProposalPageProps {
  proposal: Proposal;
  asset: Asset;
  onBack: () => void;
  onVote: () => void;
  voteStatus: VoteStatus;
}

function ProposalPage({ proposal, asset, onBack, onVote, voteStatus }: ProposalPageProps) {
  
  // This is the "Magic" - your AI Legal-Brain
  const aiAnalysis: AiAnalysis = AI_ANALYSIS; 
  
  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 text-indigo-600 font-medium mb-4 hover:underline">
        <ArrowLeft width={18} height={18} />
        Back to Asset
      </button>
      
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="p-8">
          <h1 className="text-3xl font-bold mb-1">{proposal.title}</h1>
          <p className="text-lg text-gray-600 mb-2">For Asset: <span className="font-medium text-indigo-600">{asset.title}</span></p>
          <p className="text-lg font-bold text-green-600 mb-6">{proposal.offer}</p>
          <p className="text-gray-700 leading-relaxed mb-8">{proposal.description}</p>
          
          {/* --- THIS IS THE AI LEGAL-BRAIN --- */}
          <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-indigo-900 mb-5 flex items-center gap-3">
              <Brain width={18} height={18} />
              Pramaan AI Legal-Brain Analysis
            </h2>
            
            <div className="space-y-4">
              <AnalysisItem 
                icon={aiAnalysis.compliance.icon} 
                color={aiAnalysis.compliance.color}
                title="Compliance Check" 
                status={aiAnalysis.compliance.status}
                text={aiAnalysis.compliance.text}
              />
              <AnalysisItem 
                icon={aiAnalysis.strategy.icon} 
                color={aiAnalysis.strategy.color}
                title="Strategic Analysis" 
                status={aiAnalysis.strategy.status}
                text={aiAnalysis.strategy.text}
              />
              <AnalysisItem 
                icon={aiAnalysis.risk.icon} 
                color={aiAnalysis.risk.color}
                title="Risk Assessment" 
                status={aiAnalysis.risk.status}
                text={aiAnalysis.risk.text}
              />
            </div>
          </div>
          {/* --- END OF AI LEGAL-BRAIN --- */}
          
        </div>
        
        {/* --- Voting Section --- */}
        <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
          <h3 className="text-xl font-bold mb-4">DAO Governance Vote</h3>
          
          {voteStatus === 'idle' && (
            <div className="flex items-center gap-4">
              <p className="text-gray-600">Based on the AI analysis, cast your vote.</p>
              <button 
                onClick={onVote}
                className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors"
              >
                Vote YES (Accept Offer)
              </button>
              <button className="px-6 py-3 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300 transition-colors">
                Vote NO (Reject Offer)
              </button>
            </div>
          )}
          
          {voteStatus === 'voting' && (
            <div className="flex items-center gap-3 p-4 bg-yellow-100 text-yellow-800 rounded-lg">
              <Loader2 className="animate-spin" width={18} height={18} />
              <span className="text-lg font-medium">VOTING IN PROGRESS...</span>
            </div>
          )}
          
          {voteStatus === 'voted' && (
            <div className="p-4 bg-green-100 text-green-800 rounded-lg">
              <h4 className="text-lg font-bold flex items-center gap-2 mb-2"><CheckCircle width={18} height={18} /> VOTE PASSED (82% YES)</h4>
              <p>The proposal has been accepted and the smart contract is executing the license update. The asset's license is now: "<span className="font-medium">{asset.currentLicense}</span>".</p>
This is an existing code block.
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}

interface AnalysisItemProps {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  color: string;
  title: string;
  status: string;
  text: string;
}

function AnalysisItem({ icon: Icon, color, title, status, text }: AnalysisItemProps) {
  return (
    <div className="flex items-start gap-4">
      <Icon className={`${color} mt-1 flex-shrink-0`} width={18} height={18} />
      <div>
        <h4 className={`text-lg font-bold ${color}`}>{status}</h4>
        <p className="text-sm font-medium text-gray-800 mb-1">{title}</p>
        <p className="text-gray-700">{text}</p>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="max-w-7xl mx-auto px-4 md:px-8 py-6 mt-12 border-t border-gray-200">
      <div className="flex justify-between items-center text-sm text-gray-500">
        <p>&copy; 2025 Pramaan Portal. All rights reserved.</p>
        <p>Hackathon Prototype v0.1.0</p>
      </div>
    </footer>
  );
}

