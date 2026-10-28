import * as THREE from 'three';

/** Official Solana Foundation logomark, preserving all three subpaths and curves.
 * Source: https://solana.com/src/img/branding/solanaLogoMark.svg
 * Brand guidance: https://solana.com/branding
 * Reference artwork is retained unchanged at /brands/solana-mark.svg.
 * The displayed coin uses this silhouette as a physical metal engraving.
 */
export const SOLANA_MARK_SOURCE = 'https://solana.com/src/img/branding/solanaLogoMark.svg';
export const SOLANA_MARK_SHA256 = '3d3401109aa061dec40a8659f1847817a8e647f98de1e65e76e86a95bbe1f08a';
export const SOLANA_MARK_PATH = "M100.48 69.3817L83.8068 86.8015C83.4444 87.1799 83.0058 87.4816 82.5185 87.6878C82.0312 87.894 81.5055 88.0003 80.9743 88H1.93563C1.55849 88 1.18957 87.8926 0.874202 87.6912C0.558829 87.4897 0.31074 87.2029 0.160416 86.8659C0.0100923 86.529 -0.0359181 86.1566 0.0280382 85.7945C0.0919944 85.4324 0.263131 85.0964 0.520422 84.8278L17.2061 67.408C17.5676 67.0306 18.0047 66.7295 18.4904 66.5234C18.9762 66.3172 19.5002 66.2104 20.0301 66.2095H99.0644C99.4415 66.2095 99.8104 66.3169 100.126 66.5183C100.441 66.7198 100.689 67.0067 100.84 67.3436C100.99 67.6806 101.036 68.0529 100.972 68.415C100.908 68.7771 100.737 69.1131 100.48 69.3817ZM83.8068 34.3032C83.4444 33.9248 83.0058 33.6231 82.5185 33.4169C82.0312 33.2108 81.5055 33.1045 80.9743 33.1048H1.93563C1.55849 33.1048 1.18957 33.2121 0.874202 33.4136C0.558829 33.6151 0.31074 33.9019 0.160416 34.2388C0.0100923 34.5758 -0.0359181 34.9482 0.0280382 35.3103C0.0919944 35.6723 0.263131 36.0083 0.520422 36.277L17.2061 53.6968C17.5676 54.0742 18.0047 54.3752 18.4904 54.5814C18.9762 54.7875 19.5002 54.8944 20.0301 54.8952H99.0644C99.4415 54.8952 99.8104 54.7879 100.126 54.5864C100.441 54.3849 100.689 54.0981 100.84 53.7612C100.99 53.4242 101.036 53.0518 100.972 52.6897C100.908 52.3277 100.737 51.9917 100.48 51.723L83.8068 34.3032ZM1.93563 21.7905H80.9743C81.5055 21.7907 82.0312 21.6845 82.5185 21.4783C83.0058 21.2721 83.4444 20.9704 83.8068 20.592L100.48 3.17219C100.737 2.90357 100.908 2.56758 100.972 2.2055C101.036 1.84342 100.99 1.47103 100.84 1.13408C100.689 0.79713 100.441 0.510296 100.126 0.308823C99.8104 0.107349 99.4415 1.24074e-05 99.0644 0L20.0301 0C19.5002 0.000878397 18.9762 0.107699 18.4904 0.313848C18.0047 0.519998 17.5676 0.821087 17.2061 1.19848L0.524723 18.6183C0.267681 18.8866 0.0966198 19.2223 0.0325185 19.5839C-0.0315829 19.9456 0.0140624 20.3177 0.163856 20.6545C0.31365 20.9913 0.561081 21.2781 0.875804 21.4799C1.19053 21.6817 1.55886 21.7896 1.93563 21.7905Z";
export const SOLANA_MARKS_PER_COIN = 2;
export const SOLANA_MARK_FACE_Y = .0225;

/** The trusted official path uses only absolute M/L/H/C/Z commands. */
function officialShapes(width){
  const shapes=[];let shape,x=0,y=0;const scale=width/101;
  const point=(px,py)=>[(px-50.5)*scale,(44-py)*scale];
  for(const part of SOLANA_MARK_PATH.match(/[MLHCZ][^MLHCZ]*/g)){
    const command=part[0],v=(part.slice(1).match(/[+-]?(?:\d*\.)?\d+(?:[eE][+-]?\d+)?/g)||[]).map(Number);
    if(command==='M'){shape=new THREE.Shape();shapes.push(shape);[x,y]=v;shape.moveTo(...point(x,y));}
    else if(command==='L'){[x,y]=v;shape.lineTo(...point(x,y));}
    else if(command==='H'){x=v[0];shape.lineTo(...point(x,y));}
    else if(command==='C'){shape.bezierCurveTo(...point(v[0],v[1]),...point(v[2],v[3]),...point(v[4],v[5]));[x,y]=v.slice(4);}
    else if(command==='Z')shape.closePath();
  }
  if(shapes.length!==3)throw new Error('The official Solana mark must contain three separate bars.');
  return shapes;
}

/** One complete emblem with its front normal on local +Y, matching coin faces. */
export function createSolanaCoinMarkGeometry({coinScale=1,width=.168,depth=.0015}={}){
  if(!Number.isFinite(coinScale)||coinScale<=0||!Number.isFinite(width)||width<=0||!Number.isFinite(depth)||depth<=0)throw new RangeError('Positive coin mark dimensions are required.');
  const geometry=new THREE.ExtrudeGeometry(officialShapes(width),{depth,bevelEnabled:false,curveSegments:5});
  geometry.rotateX(-Math.PI/2);geometry.scale(coinScale,coinScale,coinScale);geometry.computeBoundingBox();geometry.computeBoundingSphere();
  geometry.name='solana-official-coin-emblem';geometry.userData={source:SOLANA_MARK_SOURCE,sha256:SOLANA_MARK_SHA256,bars:3,coinScale};return geometry;
}
const faceOffset=new THREE.Matrix4(),backFacing=new THREE.Matrix4().makeRotationZ(Math.PI);
/** Full emblem per face. Z half-turn reverses the normal and preserves handedness
 * when each side is viewed head-on with local -Z as the upright screen direction. */
export function setSolanaCoinMarkMatrix(target,coinMatrix,faceIndex,coinScale=1){
  if(faceIndex!==0&&faceIndex!==1)throw new RangeError('Coin face index must be0 or1.');
  faceOffset.makeTranslation(0,(faceIndex===0?1:-1)*SOLANA_MARK_FACE_Y*coinScale,0);
  if(faceIndex===1)faceOffset.multiply(backFacing);
  return target.multiplyMatrices(coinMatrix,faceOffset);
}
