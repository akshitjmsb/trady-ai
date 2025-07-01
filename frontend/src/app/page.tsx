"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Trash2 } from "lucide-react";

interface Stock {
  ticker: string;
  quantity: number;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Home() {
  const [portfolio, setPortfolio] = useState<Stock[]>([]);
  const [ticker, setTicker] = useState("");
  const [quantity, setQuantity] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("upload");
  const [isReplying, setIsReplying] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setUploadError(null);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      setUploadError("Please select a file to upload.");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to upload file.');
      }

      setPortfolio(data.portfolio);
      setActiveTab("manual");
    } catch (error) {
      if (error instanceof Error) {
        setUploadError(error.message);
      } else {
        setUploadError("An unknown error occurred.");
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddStock = () => {
    const numQuantity = parseInt(quantity, 10);
    if (ticker.trim() && !isNaN(numQuantity) && numQuantity > 0) {
      setPortfolio([
        ...portfolio,
        { ticker: ticker.trim().toUpperCase(), quantity: numQuantity },
      ]);
      setTicker("");
      setQuantity("");
    }
  };

  const handleRemoveStock = (indexToRemove: number) => {
    setPortfolio(portfolio.filter((_, index) => index !== indexToRemove));
  };

  const handleSendMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    if (chatInput.trim() && !isReplying) {
      const newUserMessage: Message = { role: "user", content: chatInput.trim() };
      setChatMessages((prevMessages) => [...prevMessages, newUserMessage]);
      setChatInput("");
      setIsReplying(true);

      try {
        const response = await fetch('http://127.0.0.1:8000/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: newUserMessage.content }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || 'Failed to get response from Trady.');
        }

        const assistantMessage: Message = { role: "assistant", content: data.reply };
        setChatMessages((prevMessages) => [...prevMessages, assistantMessage]);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        const assistantErrorMessage: Message = {
          role: "assistant",
          content: `Sorry, I encountered an error: ${errorMessage}`,
        };
        setChatMessages((prevMessages) => [...prevMessages, assistantErrorMessage]);
      } finally {
        setIsReplying(false);
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-muted/40">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle>Portfolio</CardTitle>
              <CardDescription>
                Upload or manually enter your stock portfolio.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload">Upload File</TabsTrigger>
                  <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                </TabsList>
                <TabsContent value="upload">
                  <div className="space-y-4 pt-4">
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                      <Label htmlFor="portfolio-file">Portfolio File</Label>
                      <Input id="portfolio-file" type="file" onChange={handleFileChange} disabled={isUploading} />
                    </div>
                    <Button onClick={handleFileUpload} disabled={isUploading}>
                      {isUploading ? "Uploading..." : "Upload"}
                    </Button>
                    {uploadError && <p className="text-sm text-destructive pt-2">{uploadError}</p>}
                  </div>
                </TabsContent>
                <TabsContent value="manual">
                  <div className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="ticker">Ticker</Label>
                        <Input
                          id="ticker"
                          placeholder="e.g., AAPL"
                          value={ticker}
                          onChange={(e) => setTicker(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input
                          id="quantity"
                          type="number"
                          placeholder="e.g., 10"
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                        />
                      </div>
                    </div>
                    <Button onClick={handleAddStock}>Add Stock</Button>
                    {portfolio.length > 0 && (
                      <div className="pt-4">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Ticker</TableHead>
                              <TableHead>Quantity</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {portfolio.map((stock, index) => (
                              <TableRow key={index}>
                                <TableCell className="font-medium">
                                  {stock.ticker}
                                </TableCell>
                                <TableCell>{stock.quantity}</TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRemoveStock(index)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Chat with Trady</CardTitle>
              <CardDescription>
                Ask Trady anything about your portfolio.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col h-full">
              <div className="flex-1 space-y-4 overflow-auto p-4">
                {chatMessages.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Start a conversation with Trady.
                  </p>
                ) : (
                  chatMessages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        message.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs rounded-lg px-4 py-2 ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  ))
                )}
                {isReplying && (
                  <div className="flex justify-start">
                    <div className="max-w-xs rounded-lg bg-muted px-4 py-2">
                      <span className="animate-pulse">Trady is thinking...</span>
                    </div>
                  </div>
                )}
              </div>
              <form
                onSubmit={handleSendMessage}
                className="flex w-full items-center space-x-2 border-t pt-4"
              >
                <Input
                  id="chat-message"
                  placeholder="Ask about your portfolio..."
                  className="flex-1"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  disabled={isReplying}
                />
                <Button type="submit" disabled={isReplying}>
                  {isReplying ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    "Send"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
