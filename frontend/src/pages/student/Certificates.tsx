import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Award, 
  Download, 
  Search, 
  Calendar,
  ExternalLink,
  Trophy,
  BookOpen
} from 'lucide-react';
import { Certificate } from '@/types';
import api from '@/services/api';
import { showSuccess } from '@/utils/toast';

const Certificates: React.FC = () => {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [filteredCertificates, setFilteredCertificates] = useState<Certificate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCertificates();
  }, [user]);

  useEffect(() => {
    filterCertificates();
  }, [certificates, searchTerm]);

  const loadCertificates = async () => {
    if (!user) return;

    try {
      const res = await api.get(`/student/${user._id}/certificates`);
      setCertificates(res.data);
    } catch (error) {
      // No need to show error here, it's handled by the interceptor
    } finally {
      setIsLoading(false);
    }
  };

  const filterCertificates = () => {
    let filtered = [...certificates];

    if (searchTerm) {
      filtered = filtered.filter(cert =>
        cert.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.verificationId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort by completion date (newest first)
    filtered.sort((a, b) => new Date(b.completionDate).getTime() - new Date(a.completionDate).getTime());

    setFilteredCertificates(filtered);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDownload = (certificate: Certificate) => {
    // Mock download functionality
    showSuccess(`Certificate for "${certificate.courseName}" downloaded!`);
    
    // In a real app, this would trigger an actual download
    // const link = document.createElement('a');
    // link.href = certificate.certificateUrl;
    // link.download = `certificate-${certificate.verificationId}.pdf`;
    // link.click();
  };

  const handleShare = (certificate: Certificate) => {
    // Mock share functionality
    const shareUrl = `${window.location.origin}/verify/${certificate.verificationId}`;
    navigator.clipboard.writeText(shareUrl);
    showSuccess('Certificate verification link copied to clipboard!');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          My Certificates
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Your achievements and completed course certificates
        </p>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search certificates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        {searchTerm && (
          <div className="mt-2 flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {filteredCertificates.length} certificate{filteredCertificates.length !== 1 ? 's' : ''} found
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchTerm('')}
            >
              Clear Search
            </Button>
          </div>
        )}
      </div>

      {/* Certificates Grid */}
      {filteredCertificates.length === 0 ? (
        <div className="text-center py-12">
          <div className="mb-6">
            {certificates.length === 0 ? (
              <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            ) : (
              <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            )}
          </div>
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
            {certificates.length === 0 ? 'No certificates yet' : 'No certificates match your search'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {certificates.length === 0 
              ? 'Complete courses to earn certificates and showcase your achievements'
              : 'Try adjusting your search criteria'
            }
          </p>
          {certificates.length === 0 && (
            <Button onClick={() => window.location.href = '/courses'}>
              <BookOpen className="h-4 w-4 mr-2" />
              Browse Courses
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Certificates</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{certificates.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Latest Achievement</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-sm font-medium">
                  {certificates.length > 0 
                    ? formatDate(certificates.sort((a, b) => 
                        new Date(b.completionDate).getTime() - new Date(a.completionDate).getTime()
                      )[0].completionDate)
                    : 'N/A'
                  }
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {certificates.filter(cert => {
                    const certDate = new Date(cert.completionDate);
                    const now = new Date();
                    return certDate.getMonth() === now.getMonth() && 
                           certDate.getFullYear() === now.getFullYear();
                  }).length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Certificates List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCertificates.map((certificate) => (
              <Card key={certificate._id} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-2 mb-2">
                        {certificate.courseName}
                      </CardTitle>
                      <CardDescription>
                        Completed on {formatDate(certificate.completionDate)}
                      </CardDescription>
                    </div>
                    <Award className="h-8 w-8 text-yellow-500 flex-shrink-0 ml-4" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Verification ID</p>
                      <Badge variant="outline" className="font-mono text-xs">
                        {certificate.verificationId}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button 
                      onClick={() => handleDownload(certificate)}
                      className="flex-1 flex items-center space-x-2"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download</span>
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handleShare(certificate)}
                      className="flex items-center space-x-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>Share</span>
                    </Button>
                  </div>

                  <div className="text-center pt-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Certificate issued by UpLearn
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Certificates;