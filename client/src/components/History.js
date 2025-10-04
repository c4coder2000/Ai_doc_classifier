import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { MagnifyingGlassIcon, DocumentTextIcon, CalendarIcon, TagIcon } from '@heroicons/react/24/outline';
import DocumentDetail from './DocumentDetail';

const History = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredDocs, setFilteredDocs] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    // Filter documents based on search term
    if (searchTerm.trim() === '') {
      setFilteredDocs(documents);
    } else {
      const filtered = documents.filter(doc =>
        doc.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.label.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredDocs(filtered);
    }
  }, [searchTerm, documents]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/v1/documents/history');
      setDocuments(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch document history');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getClassificationColor = (classification) => {
    const colors = {
      'invoice': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
      'receipt': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
      'contract': 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
      'resume': 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
      'report': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300',
      'other': 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300'
    };
    return colors[classification.toLowerCase()] || colors['other'];
  };

  const handleDocumentClick = (document) => {
    setSelectedDocument(document);
    setIsDetailModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsDetailModalOpen(false);
    setSelectedDocument(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600 dark:text-slate-400">Loading your document history...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Document History
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            View and manage your classified documents
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search documents by filename or label..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Documents List */}
        {filteredDocs.length === 0 ? (
          <div className="text-center py-12">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-slate-400 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              {searchTerm ? 'No documents found' : 'No documents yet'}
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'Upload and classify your first document to see it here'
              }
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredDocs.map((doc, index) => (
              <div
                key={doc.id || index}
                onClick={() => handleDocumentClick(doc)}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 hover:shadow-xl hover:border-green-300 dark:hover:border-green-600 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <DocumentTextIcon className="h-6 w-6 text-slate-500 dark:text-slate-400" />
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white truncate">
                        {doc.filename}
                      </h3>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <TagIcon className="h-4 w-4" />
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getClassificationColor(doc.label)}`}
                        >
                          {doc.label}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-4 w-4" />
                        <span>{formatDate(doc.created_at)}</span>
                      </div>
                      
                      {doc.confidence && (
                        <div className="flex items-center gap-1">
                          <span className="text-xs">Confidence:</span>
                          <span className="font-medium">
                            {(doc.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Total documents: {filteredDocs.length}
            {searchTerm && filteredDocs.length !== documents.length && (
              <span> (filtered from {documents.length})</span>
            )}
          </p>
        </div>

        {/* Document Detail Modal */}
        <DocumentDetail
          document={selectedDocument}
          isOpen={isDetailModalOpen}
          onClose={handleCloseModal}
        />
      </div>
    </div>
  );
};

export default History;