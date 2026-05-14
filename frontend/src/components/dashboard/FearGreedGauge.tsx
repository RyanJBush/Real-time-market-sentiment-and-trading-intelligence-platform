import type { FearGreed } from '../../types/market';

export default function FearGreedGauge({ data }: { data: FearGreed | null }) {
  if (!data) return null;
  const angle = (data.score / 100) * 180 - 90;
  return <article className="panel"><h3>Fear & Greed</h3><div style={{display:'flex',alignItems:'center',gap:16}}><div style={{width:120,height:120,borderRadius:'50%',border:'8px solid #334155',position:'relative'}}><div style={{position:'absolute',left:'50%',top:'50%',width:2,height:46,background:'#f59e0b',transform:`translate(-50%, -100%) rotate(${angle}deg)`,transformOrigin:'bottom center'}} /></div><div><div style={{fontSize:'2rem',fontWeight:700}}>{data.score}</div><div className="muted">{data.label}</div></div></div></article>;
}
