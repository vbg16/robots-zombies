import importlib.util, json, tempfile, unittest
from pathlib import Path
from PIL import Image
spec=importlib.util.spec_from_file_location('walk',Path(__file__).parents[1]/'tools/validate_walk.py')
walk=importlib.util.module_from_spec(spec);spec.loader.exec_module(walk)
class Validation(unittest.TestCase):
 def setUp(self):
  self.temp=tempfile.TemporaryDirectory();self.folder=Path(self.temp.name)
  self.manifest={'width':8,'height':8,'pivot':{'x':4,'y':6},'frames':[{'file':f'{i:02}.png','ms':100} for i in range(8)]}
  self.save_manifest()
  for i in range(8):
   im=Image.new('RGBA',(8,8));im.putpixel((3,3),(60,199,244,255));im.save(self.folder/f'{i:02}.png')
 def tearDown(self):self.temp.cleanup()
 def save_manifest(self):(self.folder/'manifest.json').write_text(json.dumps(self.manifest))
 def test_valid(self):
  report=walk.validate(self.folder);self.assertEqual(report['errors'],[]);self.assertEqual(report['duration_ms'],800);self.assertEqual(report['visual_review'],'NOT_EVALUATED')
 def test_missing(self):
  (self.folder/'07.png').unlink();self.assertTrue(walk.validate(self.folder)['errors'])
 def test_corrupt(self):
  (self.folder/'03.png').write_bytes(b'broken');self.assertTrue(walk.validate(self.folder)['errors'])
 def test_alpha(self):
  im=Image.open(self.folder/'00.png');im.putpixel((3,3),(1,2,3,128));im.save(self.folder/'00.png');self.assertTrue(walk.validate(self.folder)['errors'])
 def test_margin(self):
  im=Image.open(self.folder/'00.png');im.putpixel((0,0),(1,2,3,255));im.save(self.folder/'00.png');self.assertTrue(walk.validate(self.folder)['errors'])
 def test_size(self):
  Image.new('RGBA',(10,10)).save(self.folder/'00.png');self.assertTrue(walk.validate(self.folder)['errors'])
 def test_order(self):
  self.manifest['frames'].reverse();self.save_manifest();self.assertTrue(walk.validate(self.folder)['errors'])
 def test_rgb(self):
  Image.new('RGB',(8,8)).save(self.folder/'00.png');self.assertTrue(walk.validate(self.folder)['errors'])
if __name__=='__main__':unittest.main()
