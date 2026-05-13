import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { useAuth } from "../hooks/use-auth";
import { supabase } from "../lib/supabase";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Loader2, ArrowLeft, Download, ExternalLink, Calendar, HardDrive, Search } from "lucide-react";

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string;
  webViewLink?: string;
  webContentLink?: string;
  createdTime: string;
  size: string;
}

export default function Gallery() {
  const { user } = useAuth();
  const { userId } = useParams();
  const navigate = useNavigate();
  
  const targetId = userId || user?.id;

  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [targetUser, setTargetUser] = useState<any>(null);
  const [search, setSearch] = useState("");

  const [selectedFile, setSelectedFile] = useState<DriveFile | null>(null);

  useEffect(() => {
    if (!targetId || !user) return;

    // Fetch user details if checking someone else
    if (targetId !== user.id) {
      supabase.from('users').select('name, email').eq('id', targetId).single().then(({ data }) => {
        setTargetUser(data);
      });
    } else {
      setTargetUser(user);
    }

    fetchPhotos();
  }, [targetId, user]);

  const fetchPhotos = async (pageToken?: string) => {
    try {
      if (!pageToken) setLoading(true);
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) return;

      const url = new URL(`/api/photos/${targetId}`, window.location.origin);
      if (pageToken) url.searchParams.append("pageToken", pageToken);

      const res = await fetch(url.toString(), {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (pageToken) {
        setFiles(prev => {
          const newFiles = data.files || [];
          const existingIds = new Set(prev.map(f => f.id));
          const uniqueNewFiles = newFiles.filter((f: any) => !existingIds.has(f.id));
          return [...prev, ...uniqueNewFiles];
        });
      } else {
        setFiles(data.files || []);
      }
      setNextPageToken(data.nextPageToken || null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredFiles = files.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

  // Fallback for missing thumbnails - Use proxy stream or direct link
  const getImageUrl = (file: DriveFile) => {
    if (file.thumbnailLink) {
       // Drive API returns a small thumbnail, changing size param can make it larger
       return file.thumbnailLink.replace(/=s\d+/, '=s800');
    }
    return '';
  };

  const formatSize = (bytesStr?: string) => {
    if (!bytesStr) return "Unknown size";
    const bytes = parseInt(bytesStr);
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900 flex items-center gap-2">
                Photo Gallery
              </h1>
              <p className="text-neutral-500 text-sm mt-1">
                Viewing photos for {targetUser?.name || targetUser?.email || "User"}
                {files.length > 0 && ` • Showing ${files.length} photos`}
              </p>
            </div>
          </div>
          
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
            <Input 
              placeholder="Search by file name..." 
              className="pl-9 bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </header>

        {loading && files.length === 0 ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-neutral-200">
            <p className="text-neutral-500 mb-4 cursor-default">No photos found in Google Drive.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredFiles.map((file, idx) => (
                <div 
                  key={`${file.id}-${idx}`} 
                  className="group relative aspect-square rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 cursor-pointer hover:border-primary/50 hover:shadow-lg transition-all"
                  onClick={() => setSelectedFile(file)}
                >
                  <img 
                    src={getImageUrl(file)}
                    alt={file.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                    <span className="text-white text-xs font-medium truncate">{file.name}</span>
                  </div>
                </div>
              ))}
            </div>

            {nextPageToken && (
              <div className="flex justify-center mt-8">
                <Button 
                  variant="outline" 
                  onClick={() => fetchPhotos(nextPageToken)}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Load More
                </Button>
              </div>
            )}
          </>
        )}

      </main>

      {/* Full Preview Modal */}
      <Dialog open={!!selectedFile} onOpenChange={(open) => !open && setSelectedFile(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-neutral-900 border-neutral-800 text-neutral-100 [&>button]:text-white">
          <DialogTitle className="sr-only">Photo Preview</DialogTitle>
          <DialogDescription className="sr-only">View photo details and download</DialogDescription>
          
          {selectedFile && (
            <div className="flex flex-col md:flex-row h-[80vh] md:h-[600px]">
              
              {/* Image Preview Container */}
              <div className="w-full md:w-2/3 h-full bg-black flex items-center justify-center p-4 relative">
                <img 
                   src={getImageUrl(selectedFile)}
                   className="max-w-full max-h-full object-contain"
                   alt={selectedFile.name}
                />
              </div>

              {/* Sidebar Info */}
              <div className="w-full md:w-1/3 p-6 flex flex-col bg-neutral-900 border-l border-neutral-800">
                <h3 className="font-semibold text-lg mb-1 truncate" title={selectedFile.name}>
                  {selectedFile.name}
                </h3>
                
                <div className="space-y-4 mt-6 flex-1">
                  <div className="flex items-center gap-3 text-sm text-neutral-400">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(selectedFile.createdTime).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-neutral-400">
                    <HardDrive className="w-4 h-4" />
                    <span>{formatSize(selectedFile.size)}</span>
                  </div>
                </div>
                
                <div className="space-y-3 pt-6 border-t border-neutral-800">
                  {selectedFile.webContentLink && (
                    <Button className="w-full" asChild>
                      <a href={selectedFile.webContentLink} target="_blank" rel="noopener noreferrer">
                        <Download className="w-4 h-4 mr-2" />
                        Download Original
                      </a>
                    </Button>
                  )}
                  {selectedFile.webViewLink && (
                    <Button variant="outline" className="w-full bg-transparent border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white" asChild>
                      <a href={selectedFile.webViewLink} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open in Drive
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
