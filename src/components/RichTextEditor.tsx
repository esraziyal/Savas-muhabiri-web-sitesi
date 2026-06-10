



import { useState, useRef, useEffect } from 'react';
import {
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  GripVertical,
  X,
  Image as ImageIcon,
  Loader,
  Upload,
  Settings,
  Trash2,
  Maximize2,
  Minimize2,
  Highlighter,
  Palette,
} from 'lucide-react';
import { uploadImage } from '../lib/storage';
import type { ContentBlock } from '../types/database';

interface ImageSelectionState {
  element: HTMLImageElement;
  blockIndex: number;
  rect: DOMRect;
}

interface RichTextEditorProps {
  content: ContentBlock[];
  onChange: (content: ContentBlock[]) => void;
  isUploading?: boolean;
}

export function RichTextEditor({ content, onChange, isUploading = false }: RichTextEditorProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [imageUploading, setImageUploading] = useState<number | null>(null);

  const [selectedImage, setSelectedImage] = useState<ImageSelectionState | null>(null);
  const editorRefs = useRef<(HTMLDivElement | null)[]>([]);
  const savedRange = useRef<Range | null>(null);

  // Close selection when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (selectedImage && !(e.target as HTMLElement).closest('.image-toolbar')) {
        setSelectedImage(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedImage]);

  const resizeImage = (widthPercent: number) => {
    if (!selectedImage) return;

    const { element, blockIndex } = selectedImage;
    element.style.width = `${widthPercent}%`;
    element.removeAttribute('height'); // Maintain aspect ratio

    // Update content
    if (editorRefs.current[blockIndex]) {
      updateBlock(blockIndex, { content: editorRefs.current[blockIndex]!.innerHTML });
    }

    // Update selection rect
    setSelectedImage({
      ...selectedImage,
      rect: element.getBoundingClientRect(),
    });
  };

  const handleEditorClick = (e: React.MouseEvent, index: number) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'IMG') {
      e.preventDefault(); // Prevent default browser selection
      const rect = target.getBoundingClientRect();
      setSelectedImage({
        element: target as HTMLImageElement,
        blockIndex: index,
        rect,
      });
    } else {
      // Don't deselect here immediately inside editor to avoid conflicts
    }
  };

  useEffect(() => {
    content.forEach((block, index) => {
      const el = editorRefs.current[index];
      if (el && (block.type === 'paragraph' || block.type === 'spot')) {
        // Only update if editor is empty (initial load) or content is empty
        // This prevents overwriting user's inline formatting like spot highlights
        if (!el.innerHTML || el.innerHTML === '<br>') {
          el.innerHTML = block.content;
        }
      }
    });
  }, [content]);

  const addBlock = (
    type: 'paragraph' | 'heading' | 'image' | 'spot',
    index?: number
  ) => {
    const newBlock: ContentBlock =
      type === 'paragraph'
        ? { type: 'paragraph', content: '', align: 'left' }
        : type === 'heading'
          ? { type: 'heading', content: '', level: 2 }
          : type === 'image'
            ? { type: 'image', url: '', caption: '', align: 'center' }
            : { type: 'spot', content: '', align: 'left' };

    if (typeof index === 'number') {
      const newContent = [...content];
      newContent.splice(index + 1, 0, newBlock);
      onChange(newContent);
    } else {
      onChange([...content, newBlock]);
    }
  };

  const updateBlock = (index: number, updates: Partial<ContentBlock>) => {
    const newContent = [...content];
    newContent[index] = { ...newContent[index], ...updates } as ContentBlock;
    onChange(newContent);
  };

  const deleteBlock = (index: number) => {
    onChange(content.filter((_, i) => i !== index));
  };

  const handleDragStart = (index: number) => setDraggedIndex(index);
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    const newContent = [...content];
    const draggedItem = newContent[draggedIndex];
    newContent.splice(draggedIndex, 1);
    newContent.splice(index, 0, draggedItem);
    onChange(newContent);
    setDraggedIndex(index);
  };
  const handleDragEnd = () => setDraggedIndex(null);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    content.forEach((block, index) => {
      if (editorRefs.current[index]) {
        updateBlock(index, { content: editorRefs.current[index]!.innerHTML });
      }
    });
  };

  const handleInlineImage = async (index: number) => {
    // Save current selection within the editor
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedRange.current = sel.getRangeAt(0);
    }

    // Create file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const url = await uploadImage(file);
          if (url) {
            // Restore selection
            if (savedRange.current) {
              const sel = window.getSelection();
              if (sel) {
                sel.removeAllRanges();
                sel.addRange(savedRange.current);
              }
            } else if (editorRefs.current[index]) {
              editorRefs.current[index]?.focus();
            }

            // Insert image using a wrapper with inline controls
            const wrapper = document.createElement('span');
            wrapper.style.display = 'inline-block';
            wrapper.style.position = 'relative';
            wrapper.style.margin = '8px';
            wrapper.style.verticalAlign = 'middle';
            wrapper.contentEditable = 'false';

            const img = document.createElement('img');
            img.src = url;
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
            img.style.display = 'block';
            img.style.border = '2px solid #dc2626';
            img.style.borderRadius = '4px';

            // Controls container
            const controls = document.createElement('div');
            controls.style.display = 'flex';
            controls.style.gap = '4px';
            controls.style.marginTop = '4px';
            controls.style.justifyContent = 'center';
            controls.style.flexWrap = 'wrap';

            // Create resize buttons
            const sizes = [
              { label: '25%', value: 25 },
              { label: '50%', value: 50 },
              { label: '75%', value: 75 },
              { label: '100%', value: 100 }
            ];

            sizes.forEach(({ label, value }) => {
              const btn = document.createElement('button');
              btn.textContent = label;
              btn.style.padding = '2px 8px';
              btn.style.fontSize = '11px';
              btn.style.backgroundColor = '#374151';
              btn.style.color = 'white';
              btn.style.border = '1px solid #4b5563';
              btn.style.borderRadius = '3px';
              btn.style.cursor = 'pointer';
              btn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                img.style.width = `${value}%`;
                if (editorRefs.current[index]) {
                  updateBlock(index, { content: editorRefs.current[index]!.innerHTML });
                }
              };
              btn.onmouseenter = () => {
                btn.style.backgroundColor = '#4b5563';
              };
              btn.onmouseleave = () => {
                btn.style.backgroundColor = '#374151';
              };
              controls.appendChild(btn);
            });

            // Delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = '🗑️';
            deleteBtn.style.padding = '2px 8px';
            deleteBtn.style.fontSize = '11px';
            deleteBtn.style.backgroundColor = '#dc2626';
            deleteBtn.style.color = 'white';
            deleteBtn.style.border = '1px solid #b91c1c';
            deleteBtn.style.borderRadius = '3px';
            deleteBtn.style.cursor = 'pointer';
            deleteBtn.onclick = (e) => {
              e.preventDefault();
              e.stopPropagation();
              wrapper.remove();
              if (editorRefs.current[index]) {
                updateBlock(index, { content: editorRefs.current[index]!.innerHTML });
              }
            };
            deleteBtn.onmouseenter = () => {
              deleteBtn.style.backgroundColor = '#b91c1c';
            };
            deleteBtn.onmouseleave = () => {
              deleteBtn.style.backgroundColor = '#dc2626';
            };

            // Confirm button
            const confirmBtn = document.createElement('button');
            confirmBtn.textContent = '✓';
            confirmBtn.style.padding = '2px 8px';
            confirmBtn.style.fontSize = '11px';
            confirmBtn.style.backgroundColor = '#16a34a';
            confirmBtn.style.color = 'white';
            confirmBtn.style.border = '1px solid #15803d';
            confirmBtn.style.borderRadius = '3px';
            confirmBtn.style.cursor = 'pointer';
            confirmBtn.onclick = (e) => {
              e.preventDefault();
              e.stopPropagation();
              // Hide controls and finalize image
              controls.style.display = 'none';
              img.style.border = 'none';
              if (editorRefs.current[index]) {
                updateBlock(index, { content: editorRefs.current[index]!.innerHTML });
              }
            };
            confirmBtn.onmouseenter = () => {
              confirmBtn.style.backgroundColor = '#15803d';
            };
            confirmBtn.onmouseleave = () => {
              confirmBtn.style.backgroundColor = '#16a34a';
            };
            controls.appendChild(confirmBtn);
            controls.appendChild(deleteBtn);

            wrapper.appendChild(img);
            wrapper.appendChild(controls);

            // Insert wrapper at cursor
            if (savedRange.current) {
              savedRange.current.deleteContents();
              savedRange.current.insertNode(wrapper);
            } else if (editorRefs.current[index]) {
              editorRefs.current[index]!.appendChild(wrapper);
            }

            // Trigger update
            if (editorRefs.current[index]) {
              updateBlock(index, { content: editorRefs.current[index]!.innerHTML });
            }
          }
        } catch (error) {
          console.error('Error uploading inline image:', error);
        }
      }
    };
    input.click();
  };

  const renderBlockEditor = (block: ContentBlock, index: number) => {
    switch (block.type) {
      case 'paragraph':
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2 mb-2 bg-gray-800 p-2 rounded">
              <button
                type="button"
                onClick={() => execCommand('bold')}
                className="p-1 hover:bg-gray-700 text-white rounded transition-colors"
                title="Kalın"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => execCommand('italic')}
                className="p-1 hover:bg-gray-700 text-white rounded transition-colors"
                title="İtalik"
              >
                <Italic className="w-4 h-4" />
              </button>
              <div className="w-px h-4 bg-gray-700 mx-1" />
              <button
                type="button"
                onClick={() => handleInlineImage(index)}
                className="p-1 hover:bg-gray-700 text-white rounded transition-colors"
                title="Araya Resim Ekle"
              >
                <ImageIcon className="w-4 h-4" />
              </button>
              <div className="w-px h-4 bg-gray-700 mx-1" />
              {/* Multiple Spot Color Options */}
              {[
                { bg: '#dc2626', text: 'white', label: 'Kırmızı Spot', icon: 'text-red-500' },
                { bg: '#ea580c', text: 'white', label: 'Turuncu Spot', icon: 'text-orange-500' },
                { bg: '#ca8a04', text: 'white', label: 'Sarı Spot', icon: 'text-yellow-600' },
                { bg: '#16a34a', text: 'white', label: 'Yeşil Spot', icon: 'text-green-600' },
                { bg: '#2563eb', text: 'white', label: 'Mavi Spot', icon: 'text-blue-600' },
                { bg: '#9333ea', text: 'white', label: 'Mor Spot', icon: 'text-purple-600' },
              ].map((color, colorIndex) => (
                <button
                  key={colorIndex}
                  type="button"
                  onClick={() => {
                    const selection = window.getSelection();
                    if (!selection || selection.rangeCount === 0) return;

                    const range = selection.getRangeAt(0);
                    let node = range.startContainer;

                    // If text node, get parent element
                    if (node.nodeType === Node.TEXT_NODE) {
                      node = node.parentElement!;
                    }

                    // Check if already in a spot span
                    let spotSpan = (node as Element).closest('span[data-spot="true"]');

                    if (spotSpan) {
                      // Remove Spot: unwrap the span
                      const parent = spotSpan.parentNode;
                      while (spotSpan.firstChild) {
                        parent?.insertBefore(spotSpan.firstChild, spotSpan);
                      }
                      parent?.removeChild(spotSpan);
                    } else {
                      // Apply Spot: wrap selection in styled span
                      const span = document.createElement('span');
                      span.setAttribute('data-spot', 'true');
                      span.style.backgroundColor = color.bg;
                      span.style.color = color.text;
                      span.style.padding = '6px 12px';
                      span.style.borderRadius = '4px';
                      span.style.display = 'inline-block';
                      span.style.fontStyle = 'italic';

                      try {
                        range.surroundContents(span);
                      } catch (e) {
                        // If surroundContents fails, extract and append
                        span.appendChild(range.extractContents());
                        range.insertNode(span);
                      }
                    }

                    // Trigger sync
                    if (editorRefs.current[index]) {
                      updateBlock(index, { content: editorRefs.current[index]!.innerHTML });
                    }

                    // Clear selection
                    selection.removeAllRanges();
                  }}
                  className="p-1 hover:bg-gray-700 text-white rounded transition-colors"
                  title={color.label}
                >
                  <Highlighter className={`w-4 h-4 ${color.icon}`} />
                </button>
              ))}
              <div className="w-px h-4 bg-gray-700 mx-1" />
              <div className="relative flex items-center justify-center p-1 hover:bg-gray-700 rounded transition-colors group" title="Yazı Rengi">
                <input
                  type="color"
                  onClick={() => {
                    const sel = window.getSelection();
                    if (sel && sel.rangeCount > 0) {
                      savedRange.current = sel.getRangeAt(0);
                    }
                  }}
                  onChange={(e) => {
                    if (savedRange.current) {
                      const sel = window.getSelection();
                      if (sel) {
                        sel.removeAllRanges();
                        sel.addRange(savedRange.current);
                      }
                    }
                    execCommand('foreColor', e.target.value);
                  }}
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                />
                <Palette className="w-4 h-4 text-white" />
              </div>
              <button
                type="button"
                onClick={() => execCommand('fontSize', '3')}
                className="px-2 py-1 text-sm hover:bg-gray-700 text-white rounded transition-colors"
                title="Normal Yazı"
              >
                Normal
              </button>
              <button
                type="button"
                onClick={() => execCommand('fontSize', '5')}
                className="px-2 py-1 text-base hover:bg-gray-700 text-white rounded transition-colors"
                title="Büyük Yazı"
              >
                Büyük
              </button>
              <button
                type="button"
                onClick={() => execCommand('fontSize', '7')}
                className="px-2 py-1 text-lg font-bold hover:bg-gray-700 text-white rounded transition-colors"
                title="Çok Büyük Yazı"
              >
                Dev
              </button>
              <div className="w-px h-4 bg-gray-700 mx-1" />
              <button
                type="button"
                onClick={() => updateBlock(index, { align: 'left' })}
                className={`p-1 hover:bg-gray-700 text-white rounded transition-colors ${block.align === 'left' ? 'bg-gray-700' : ''
                  }`}
                title="Sola Hizala"
              >
                <AlignLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => updateBlock(index, { align: 'center' })}
                className={`p-1 hover:bg-gray-700 text-white rounded transition-colors ${block.align === 'center' ? 'bg-gray-700' : ''
                  }`}
                title="Ortala"
              >
                <AlignCenter className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => updateBlock(index, { align: 'right' })}
                className={`p-1 hover:bg-gray-700 text-white rounded transition-colors ${block.align === 'right' ? 'bg-gray-700' : ''
                  }`}
                title="Sağa Hizala"
              >
                <AlignRight className="w-4 h-4" />
              </button>
            </div>

            <div
              ref={(el) => (editorRefs.current[index] = el)}
              contentEditable
              suppressContentEditableWarning
              onClick={(e) => handleEditorClick(e, index)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-red-600 text-white"
              style={{
                textAlign: block.align,
                direction: 'ltr',
                whiteSpace: 'pre-wrap',
                fontSize: '16px',
              }}
              onInput={(e) =>
                updateBlock(index, { content: (e.target as HTMLDivElement).innerHTML })
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  document.execCommand('insertHTML', false, '<br><br>');
                }
              }}
              onPaste={(e) => {
                e.preventDefault();
                const text = e.clipboardData.getData('text/plain');
                document.execCommand('insertText', false, text);
              }}
            />
          </div>
        );

      case 'heading':
        return (
          <div className="space-y-2">
            <input
              type="text"
              value={block.content}
              onChange={(e) => updateBlock(index, { content: e.target.value })}
              placeholder="Başlık metni..."
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded text-white text-xl font-bold focus:outline-none focus:border-red-600"
            />
          </div>
        );

      case 'image':
        return (
          <div className="space-y-2">
            {block.url ? (
              <div className="relative inline-block">
                <img src={block.url} alt="Preview" className="max-w-md rounded" />
                <button
                  type="button"
                  onClick={() => updateBlock(index, { url: '' })}
                  className="absolute top-2 right-2 p-1 bg-red-600 hover:bg-red-700 text-white rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex items-center justify-center px-6 py-4 border-2 border-dashed border-gray-700 rounded cursor-pointer hover:border-red-600 transition-colors">
                <div className="text-center">
                  {imageUploading === index ? (
                    <>
                      <Loader className="w-6 h-6 text-red-600 mx-auto mb-2 animate-spin" />
                      <p className="text-gray-400 text-sm">Yükleniyor...</p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-gray-500 mx-auto mb-2" />
                      <p className="text-gray-400 text-sm">Görsel seçin</p>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setImageUploading(index);
                      const url = await uploadImage(file);
                      if (url) updateBlock(index, { url });
                      setImageUploading(null);
                    }
                  }}
                  hidden
                />
              </label>
            )}
            <input
              type="text"
              value={block.caption || ''}
              onChange={(e) => updateBlock(index, { caption: e.target.value })}
              placeholder="Görsel açıklaması (opsiyonel)..."
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-red-600"
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Floating Image Toolbar */}
      {selectedImage && (
        <div
          className="image-toolbar fixed z-50 flex items-center gap-2 p-2 bg-gray-900 border border-gray-600 rounded shadow-xl"
          style={{
            top: selectedImage.rect.top + window.scrollY - 50,
            left: selectedImage.rect.left + window.scrollX,
          }}
        >
          <div className="flex items-center gap-1">
            <button onClick={() => resizeImage(25)} className="px-2 py-1 text-xs text-white hover:bg-gray-700 rounded transition-colors" title="%25">
              <Minimize2 className="w-3 h-3 md:hidden" />
              <span className="hidden md:inline">%25</span>
            </button>
            <button onClick={() => resizeImage(50)} className="px-2 py-1 text-xs text-white hover:bg-gray-700 rounded transition-colors" title="%50">
              %50
            </button>
            <button onClick={() => resizeImage(75)} className="px-2 py-1 text-xs text-white hover:bg-gray-700 rounded transition-colors" title="%75">
              %75
            </button>
            <button onClick={() => resizeImage(100)} className="px-2 py-1 text-xs text-white hover:bg-gray-700 rounded transition-colors" title="%100">
              <Maximize2 className="w-3 h-3 md:hidden" />
              <span className="hidden md:inline">%100</span>
            </button>
          </div>
          <div className="w-px h-6 bg-gray-600" />
          <div className="flex items-center gap-1">
            <input
              type="number"
              placeholder="Genişlik"
              className="w-20 px-2 py-1 text-xs bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:border-red-600"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const value = parseInt((e.target as HTMLInputElement).value);
                  if (value && value > 0) {
                    if (selectedImage) {
                      selectedImage.element.style.width = `${value}px`;
                      selectedImage.element.removeAttribute('height');
                      if (editorRefs.current[selectedImage.blockIndex]) {
                        updateBlock(selectedImage.blockIndex, { content: editorRefs.current[selectedImage.blockIndex]!.innerHTML });
                      }
                      setSelectedImage({
                        ...selectedImage,
                        rect: selectedImage.element.getBoundingClientRect(),
                      });
                    }
                  }
                }
              }}
            />
            <span className="text-xs text-gray-400">px</span>
          </div>
          <div className="w-px h-6 bg-gray-600" />
          <button
            onClick={() => {
              selectedImage.element.remove();
              setSelectedImage(null);
              if (editorRefs.current[selectedImage.blockIndex]) {
                updateBlock(selectedImage.blockIndex, { content: editorRefs.current[selectedImage.blockIndex]!.innerHTML });
              }
            }}
            className="p-1 text-red-500 hover:bg-gray-700 rounded transition-colors"
            title="Sil"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 p-4 bg-gray-900 border border-gray-800 rounded-lg sticky top-4 z-10 shadow-xl">
        <span className="text-sm font-medium text-gray-400 mr-2">En Alta Ekle:</span>
        <button
          type="button"
          onClick={() => addBlock('paragraph')}
          className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded text-sm transition-colors border border-gray-700"
        >
          Paragraf
        </button>
        <button
          type="button"
          onClick={() => addBlock('heading')}
          className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded text-sm transition-colors border border-gray-700"
        >
          Başlık
        </button>
        <button
          type="button"
          onClick={() => addBlock('image')}
          className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded text-sm transition-colors border border-gray-700"
        >
          Görsel
        </button>
      </div>

      <div className="space-y-6">
        {content.map((block, index) => (
          <div key={index} className="relative group/block">
            <div
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`bg-gray-900 border border-gray-800 rounded-lg p-6 transition-all ${draggedIndex === index
                ? 'opacity-50 scale-95'
                : 'hover:border-gray-700'
                }`}
            >
              <div className="flex items-start space-x-4">
                <button className="cursor-move text-gray-600 hover:text-gray-400 mt-2 p-1">
                  <GripVertical className="w-5 h-5" />
                </button>
                <div className="flex-1">{renderBlockEditor(block, index)}</div>
                <div className="flex items-start space-x-2 mt-2">
                  <button
                    onClick={() => deleteBlock(index)}
                    className="text-gray-600 hover:text-red-500 p-2 rounded hover:bg-red-900/20 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Insert Between Blocks Button */}
            <div className="h-4 -my-2 flex items-center justify-center opacity-0 group-hover/block:opacity-100 transition-opacity z-10 relative pointer-events-none group-hover/block:pointer-events-auto">
              <div className="bg-gray-800 rounded-full shadow-lg border border-gray-700 flex items-center p-1 gap-1 transform translate-y-2">
                <span className="text-xs text-gray-500 px-2">Buraya Ekle:</span>
                <button
                  type="button"
                  onClick={() => addBlock('paragraph', index)}
                  className="p-1 hover:bg-gray-700 text-gray-300 rounded"
                  title="Paragraf"
                >
                  <AlignLeft className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => addBlock('image', index)}
                  className="p-1 hover:bg-gray-700 text-gray-300 rounded"
                  title="Görsel"
                >
                  <Upload className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => addBlock('heading', index)}
                  className="p-1 hover:bg-gray-700 text-gray-300 rounded"
                  title="Başlık"
                >
                  <Bold className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
