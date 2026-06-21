import zipfile, re
from xml.etree import ElementTree as ET

NS='{http://schemas.openxmlformats.org/spreadsheetml/2006/main}'

def colnum(col):  # 'GB' -> 184 (1-based)
    n=0
    for ch in col: n=n*26+(ord(ch)-64)
    return n
def colletter(n):
    s=''
    while n: n,r=divmod(n-1,26); s=chr(65+r)+s
    return s

class Wb:
    def __init__(self, path):
        self.z=zipfile.ZipFile(path)
        # shared strings
        self.sst=[]
        if 'xl/sharedStrings.xml' in self.z.namelist():
            r=ET.fromstring(self.z.read('xl/sharedStrings.xml'))
            for si in r.findall(NS+'si'):
                self.sst.append(''.join(t.text or '' for t in si.iter(NS+'t')))
        # theme colors
        self.theme=self._theme()
        # styles: cellXfs -> fillId -> fill fgColor
        self.fills=self._fills()
        self.cellxf_fill=self._cellxfs()
    def _theme(self):
        out=[]
        try:
            r=ET.fromstring(self.z.read('xl/theme/theme1.xml'))
            tns='{http://schemas.openxmlformats.org/drawingml/2006/main}'
            scheme=r.find('.//'+tns+'clrScheme')
            for c in scheme:
                srgb=c.find(tns+'srgbClr'); sys=c.find(tns+'sysClr')
                if srgb is not None: out.append(srgb.get('val'))
                elif sys is not None: out.append(sys.get('lastClr') or sys.get('val'))
                else: out.append(None)
        except Exception as e:
            pass
        # reorder: theme index 0,1 are swapped (lt1/dk1) in OOXML convention
        if len(out)>=2:
            out[0],out[1]=out[1],out[0]
            out[2],out[3]=out[3],out[2]
        return out
    def _fills(self):
        r=ET.fromstring(self.z.read('xl/styles.xml'))
        fills=[]
        for f in r.find(NS+'fills'):
            pf=f.find(NS+'patternFill')
            color=None
            if pf is not None:
                fg=pf.find(NS+'fgColor')
                if fg is not None:
                    color=self._color(fg)
            fills.append(color)
        return fills
    def _cellxfs(self):
        r=ET.fromstring(self.z.read('xl/styles.xml'))
        out=[]
        cx=r.find(NS+'cellXfs')
        for xf in cx:
            out.append(int(xf.get('fillId','0')))
        return out
    def _color(self, el):
        rgb=el.get('rgb')
        if rgb: return rgb[-6:].upper()
        th=el.get('theme')
        if th is not None:
            base=self.theme[int(th)] if int(th)<len(self.theme) else None
            tint=el.get('tint')
            if base and tint: return self._apply_tint(base, float(tint))
            return base
        return None
    def _apply_tint(self, hexc, tint):
        r=int(hexc[0:2],16); g=int(hexc[2:4],16); b=int(hexc[4:6],16)
        def ap(c):
            if tint<0: return int(c*(1+tint))
            else: return int(c*(1-tint)+255*tint)
        return '%02X%02X%02X'%(ap(r),ap(g),ap(b))
    def sheet(self, fname):
        return Sheet(self, fname)

class Sheet:
    def __init__(self, wb, fname):
        self.wb=wb
        self.root=ET.fromstring(wb.z.read(fname))
        self.cells={}   # (rownum, colnum) -> (value, fillcolor)
        self.maxrow=0; self.maxcol=0
        for row in self.root.iter(NS+'row'):
            rn=int(row.get('r'))
            for c in row.findall(NS+'c'):
                ref=c.get('r'); m=re.match(r'([A-Z]+)(\d+)',ref)
                cl=colnum(m.group(1)); 
                s=c.get('s'); t=c.get('t')
                fill=None
                if s is not None:
                    fid=wb.cellxf_fill[int(s)]
                    fill=wb.fills[fid]
                v=c.find(NS+'v'); val=None
                if v is not None:
                    if t=='s': val=wb.sst[int(v.text)]
                    else: val=v.text
                elif t=='inlineStr':
                    isn=c.find(NS+'is'); val=''.join(x.text or '' for x in isn.iter(NS+'t')) if isn is not None else None
                if val is not None or (fill and fill not in ('FFFFFF','000000')):
                    self.cells[(rn,cl)]=(val,fill)
                self.maxrow=max(self.maxrow,rn); self.maxcol=max(self.maxcol,cl)
    def get(self,r,c): 
        return self.cells.get((r,c),(None,None))
